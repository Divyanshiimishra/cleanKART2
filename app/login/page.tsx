"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Camera, Gift, Leaf, Sparkles } from "lucide-react";
import GitHubSignInButton from "@/components/GitHubSignInButton";

const BENEFITS = [
  { icon: Camera, text: "Capture before and after photos" },
  { icon: Sparkles, text: "Earn points for verified cleanups" },
  { icon: Gift, text: "Explore rewards and vouchers" },
];

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace("/home");
  }, [session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f8f1] px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-semibold text-[#53604c] transition-colors hover:bg-white hover:text-[#315e12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#639922]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to home
        </Link>

        <div className="rounded-[1.75rem] border border-[#dce7d4] bg-white p-6 shadow-[0_20px_60px_rgba(49,94,18,0.1)] sm:p-8">
          <div className="text-center">
            <Image
              src="/logo.png"
              alt="CleanKart"
              width={160}
              height={71}
              className="mx-auto h-12 w-auto object-contain"
              priority
            />
            <h1 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-[#244b0d]">
              Welcome to CleanKart
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#667160]">
              Sign in with GitHub to start documenting cleanups and earning points.
            </p>
          </div>

          <GitHubSignInButton className="mt-7 w-full sm:w-full" />

          <div className="my-7 h-px bg-[#e1e9dc]" />

          <div className="space-y-4">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div key={benefit.text} className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f3dc] text-[#3f7418]">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <p className="text-sm font-medium text-[#53604c]">{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-[#74806e]">
          {status === "loading"
            ? "Checking your session…"
            : "Authentication is handled securely by GitHub. CleanKart never receives your GitHub password."}
        </p>
      </div>
    </div>
  );
}
