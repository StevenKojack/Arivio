import Link from "next/link";

type LogoProps = {
  inverted?: boolean;
};

export function Logo({ inverted }: LogoProps) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <span
        className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg shadow-[0_14px_30px_rgba(20,20,20,0.16)] transition duration-300 group-hover:-translate-y-0.5 ${
          inverted ? "bg-white text-neutral-950" : "bg-neutral-950 text-white"
        }`}
      >
        <span className="absolute inset-x-2 top-2 h-2 rounded-full bg-[#ff5a5f]" />
        <span className="relative text-lg font-semibold tracking-tight">A</span>
      </span>
      <span
        className={`text-xl font-semibold tracking-tight ${
          inverted ? "text-white" : "text-neutral-950"
        }`}
      >
        Arivio
      </span>
    </Link>
  );
}
