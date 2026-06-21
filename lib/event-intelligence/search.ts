import {
  eventExamples,
  eventTaxonomyProfiles,
  getDefaultProfile,
} from "./taxonomy";
import type { EventRecognition, EventTaxonomyProfile } from "./types";

const synonymFamilies = [
  ["bbq", "barbecue", "barbeque", "cookout"],
  ["conference", "seminar", "summit"],
  ["convention", "expo", "trade show", "tradeshow"],
  ["memorial", "funeral", "celebration of life", "wake", "repass"],
  ["sweet 16", "sweet sixteen"],
  ["quinceanera", "quince"],
  ["bar mitzvah", "bat mitzvah", "mitzvah"],
  ["corporate", "company", "business"],
];

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function recognizeEventIntent(query: string): EventRecognition {
  const normalizedQuery = normalizeSearchText(query);
  const matches = scoreProfiles(normalizedQuery);
  const best = matches[0];
  const profile = best?.profile ?? getDefaultProfile();
  const preservedSubtype = inferSubtype(query, profile);
  const tags = Array.from(
    new Set([
      profile.id,
      normalizeSearchText(profile.primaryType),
      ...profile.recommendedTags,
      ...expandSynonyms(normalizedQuery),
      ...(preservedSubtype ? [normalizeSearchText(preservedSubtype)] : []),
    ]),
  ).filter(Boolean);

  return {
    confidence: best?.score ?? 0.35,
    matchedAlias: best?.matchedAlias ?? profile.aliases[0],
    normalizedQuery,
    preservedSubtype,
    profile,
    tags,
  };
}

export function searchEventIntents(query: string, limit = 7) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return eventExamples.slice(0, limit).map((example) => {
      const recognition = recognizeEventIntent(example);

      return {
        label: example,
        recognition,
      };
    });
  }

  return scoreProfiles(normalizedQuery)
    .slice(0, limit)
    .map((match) => ({
      label: buildSuggestionLabel(match.profile, query),
      recognition: {
        confidence: match.score,
        matchedAlias: match.matchedAlias,
        normalizedQuery,
        preservedSubtype: inferSubtype(query, match.profile),
        profile: match.profile,
        tags: Array.from(
          new Set([
            match.profile.id,
            ...match.profile.recommendedTags,
            ...expandSynonyms(normalizedQuery),
          ]),
        ),
      },
    }));
}

function scoreProfiles(normalizedQuery: string) {
  return eventTaxonomyProfiles
    .map((profile) => {
      const aliases = [
        profile.primaryType,
        profile.subtype ?? "",
        ...profile.aliases,
        ...profile.recommendedTags,
      ].map(normalizeSearchText);
      const bestAlias = aliases
        .map((alias) => ({
          alias,
          score: scoreAlias(normalizedQuery, alias),
        }))
        .sort((a, b) => b.score - a.score)[0];
      const synonymScore = expandSynonyms(normalizedQuery).some((term) =>
        aliases.some((alias) => alias.includes(term) || term.includes(alias)),
      )
        ? 0.82
        : 0;

      return {
        matchedAlias: bestAlias?.alias ?? profile.aliases[0],
        profile,
        score: Math.max(bestAlias?.score ?? 0, synonymScore),
      };
    })
    .sort((a, b) => b.score - a.score);
}

function scoreAlias(query: string, alias: string) {
  if (!query) {
    return 0.5;
  }

  if (query === alias) {
    return 1;
  }

  if (query.includes(alias) || alias.includes(query)) {
    return 0.9;
  }

  const queryWords = new Set(query.split(" "));
  const aliasWords = alias.split(" ");
  const overlap = aliasWords.filter((word) => queryWords.has(word)).length;
  const overlapScore = overlap / Math.max(aliasWords.length, 1);
  const fuzzy = 1 - levenshteinDistance(query, alias) / Math.max(query.length, alias.length, 1);

  return Math.max(overlapScore * 0.75, fuzzy * 0.7);
}

function expandSynonyms(query: string) {
  const expanded = new Set<string>();

  for (const family of synonymFamilies) {
    if (family.some((term) => query.includes(term))) {
      family.forEach((term) => expanded.add(term));
    }
  }

  return Array.from(expanded);
}

function inferSubtype(query: string, profile: EventTaxonomyProfile) {
  const trimmed = query.trim();

  if (!trimmed) {
    return profile.subtype;
  }

  const normalized = normalizeSearchText(trimmed);

  if (normalized === normalizeSearchText(profile.primaryType)) {
    return profile.subtype;
  }

  return trimmed;
}

function buildSuggestionLabel(profile: EventTaxonomyProfile, query: string) {
  const subtype = inferSubtype(query, profile);

  if (subtype && normalizeSearchText(subtype) !== normalizeSearchText(profile.primaryType)) {
    return `${profile.primaryType}: ${subtype}`;
  }

  return profile.subtype
    ? `${profile.primaryType}: ${profile.subtype}`
    : profile.primaryType;
}

function levenshteinDistance(left: string, right: string) {
  const rows = Array.from({ length: left.length + 1 }, (_, index) => [index]);

  for (let column = 1; column <= right.length; column += 1) {
    rows[0][column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;

      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + cost,
      );
    }
  }

  return rows[left.length][right.length];
}
