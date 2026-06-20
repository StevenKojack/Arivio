type CategoryCardProps = {
  name: string;
};

export function CategoryCard({ name }: CategoryCardProps) {
  return (
    <article className="group flex min-h-32 flex-col justify-between rounded-lg border border-neutral-200 bg-white p-5 shadow-[0_18px_40px_rgba(20,20,20,0.05)] transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_22px_52px_rgba(20,20,20,0.09)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-950 text-sm font-semibold text-white">
        {name.slice(0, 1)}
      </div>
      <h3 className="text-lg font-semibold text-neutral-950">{name}</h3>
    </article>
  );
}
