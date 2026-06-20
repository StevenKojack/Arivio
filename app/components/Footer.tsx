import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 px-6 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo inverted />
          <p className="mt-2 text-sm text-neutral-400">
            The modern marketplace for planning every event.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-300">
          <Link className="transition hover:text-white" href="/#categories">
            Categories
          </Link>
          <Link className="transition hover:text-white" href="/marketplace">
            Marketplace
          </Link>
          <Link className="transition hover:text-white" href="/account">
            Account
          </Link>
          <Link className="transition hover:text-white" href="/">
            Home
          </Link>
          <Link className="transition hover:text-white" href="/plan">
            Start Planning
          </Link>
        </div>
      </div>
    </footer>
  );
}
