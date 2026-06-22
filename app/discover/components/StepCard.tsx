"use client";

import type { ReactNode } from "react";

type StepCardProps = {
  action: ReactNode;
  body: string;
  children: ReactNode;
  eyebrow: string;
  title: string;
};

export function StepCard({ action, body, children, eyebrow, title }: StepCardProps) {
  return (
    <div className="grid min-w-0 animate-[fadeUp_220ms_ease-out] gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:p-10">
      <div className="flex flex-col justify-between gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d94f48]">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-neutral-600">{body}</p>
        </div>
        <div>{action}</div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
