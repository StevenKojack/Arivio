import Link from "next/link";
import { Logo } from "./Logo";

const navItems = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Plan", href: "/plan" },
  { label: "Vendor", href: "/vendor/dashboard" },
  { label: "Account", href: "/account" },
  { label: "Admin", href: "/admin" },
  { label: "Setup", href: "/setup" },
];

export function Navigation() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/85 px-6 backdrop-blur-xl sm:px-8 lg:px-12">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between">
        <Logo />
        <div className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-neutral-950"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="/plan"
          className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950"
        >
          Start Planning
        </Link>
      </nav>
    </header>
  );
}
