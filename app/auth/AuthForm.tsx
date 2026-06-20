"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { upsertProfile } from "@/lib/repositories/profilesRepository";
import type { UserRole } from "@/lib/types/domain";

type AuthFormProps = {
  mode: "login" | "signup";
};

const roles: Array<{ label: string; value: UserRole }> = [
  { label: "Planner", value: "planner" },
  { label: "Vendor", value: "vendor" },
  { label: "Admin", value: "admin" },
];

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("planner");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = mode === "signup";

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!hasSupabaseConfig()) {
      setError(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createBrowserSupabaseClient();

      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.user) {
          await upsertProfile(supabase, {
            email,
            fullName: fullName || null,
            phone: phone || null,
            role,
            userId: data.user.id,
          });
          setStatus("Account created. You can continue to your dashboard.");
        }

        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.push("/account");
      router.refresh();
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Something went wrong with authentication.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submitAuth}
      className="mx-auto mt-10 grid max-w-xl gap-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_22px_60px_rgba(20,20,20,0.07)]"
    >
      {isSignup ? (
        <label className="grid gap-2 text-sm font-semibold text-neutral-800">
          Full name
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
            placeholder="Your name"
          />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm font-semibold text-neutral-800">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
          placeholder="you@example.com"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-neutral-800">
        Password
        <input
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
          placeholder="At least 6 characters"
        />
      </label>
      {isSignup ? (
        <>
          <label className="grid gap-2 text-sm font-semibold text-neutral-800">
            Phone
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
              placeholder="Optional"
            />
          </label>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold text-neutral-800">
              Account type
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {roles.map((item) => (
                <label
                  key={item.value}
                  className={`cursor-pointer rounded-lg border p-4 text-sm font-semibold transition ${
                    role === item.value
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-950"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    checked={role === item.value}
                    onChange={() => setRole(item.value)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {status}
        </p>
      ) : null}
      <button
        disabled={isSubmitting}
        className="h-12 rounded-full bg-[#ff5a5f] px-6 text-sm font-semibold text-white transition hover:bg-[#e84f54] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Working..." : isSignup ? "Create account" : "Log in"}
      </button>
      <p className="text-center text-sm text-neutral-500">
        {isSignup ? "Already have an account?" : "New to Arivio?"}{" "}
        <Link
          className="font-semibold text-neutral-950"
          href={isSignup ? "/auth/login" : "/auth/signup"}
        >
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
