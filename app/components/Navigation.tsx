const navItems = [
  { label: "Explore", href: "#categories" },
  { label: "Categories", href: "#categories" },
];

export function Navigation() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/85 px-6 backdrop-blur-xl sm:px-8 lg:px-12">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between">
        <a href="#" className="text-xl font-semibold tracking-tight text-neutral-950">
          Arivio
        </a>
        <div className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-neutral-950"
            >
              {item.label}
            </a>
          ))}
        </div>
        <a
          href="#start"
          className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950"
        >
          Start Planning
        </a>
      </nav>
    </header>
  );
}
