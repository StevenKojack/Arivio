import { CategoryCard } from "./CategoryCard";

const categories = [
  "Birthday",
  "Wedding",
  "Graduation",
  "Corporate",
  "Seminar",
  "Convention",
  "Funeral",
  "Baby Shower",
  "Fundraiser",
  "Private Party",
];

export function CategorySection() {
  return (
    <section id="categories" className="bg-white px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 border-t border-neutral-200 pt-12 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
              Event types
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Start with the occasion. Bring the rest together in minutes.
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-neutral-600">
            Browse popular celebrations and professional gatherings, then build
            the right mix of spaces, services, and details around them.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard key={category} name={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
