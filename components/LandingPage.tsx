import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  Gift,
  Leaf,
  MapPin,
  Recycle,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import GitHubSignInButton from "@/components/GitHubSignInButton";

const FEATURES = [
  {
    icon: Camera,
    title: "Capture the change",
    description:
      "Take before-and-after photos and add the cleanup location in a simple guided flow.",
  },
  {
    icon: Sparkles,
    title: "Get verified",
    description:
      "CleanKart reviews the result and gives helpful feedback on the impact you made.",
  },
  {
    icon: Gift,
    title: "Earn and redeem",
    description:
      "Build points with verified cleanups, then explore available rewards and vouchers.",
  },
  {
    icon: UsersRound,
    title: "Move together",
    description:
      "Discover community drives, support local groups, and clean alongside people nearby.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Spot a place",
    description: "Choose a street, park, or shared space that needs care.",
  },
  {
    number: "02",
    title: "Document your cleanup",
    description: "Capture before and after photos, then submit the location.",
  },
  {
    number: "03",
    title: "Grow your impact",
    description: "Earn points, track progress, and join community drives.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f8f1] text-[#17230f]">
      <header className="sticky top-0 z-40 border-b border-[#dfe9d8]/80 bg-[#f4f8f1]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:min-h-20 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="CleanKart home"
            className="flex cursor-pointer items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#639922]"
          >
            <Image
              src="/logo.png"
              alt="CleanKart"
              width={140}
              height={62}
              className="h-9 sm:h-10 w-auto object-contain"
              priority
            />
          </Link>

          <nav aria-label="Landing page" className="flex items-center gap-2 sm:gap-5">
            <div className="hidden items-center gap-5 md:flex">
              <Link
                href="#how-it-works"
                className="cursor-pointer text-sm font-medium text-[#53604c] transition-colors hover:text-[#315e12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#639922]"
              >
                How it works
              </Link>
              <Link
                href="#features"
                className="cursor-pointer text-sm font-medium text-[#53604c] transition-colors hover:text-[#315e12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#639922]"
              >
                Features
              </Link>
            </div>
            <GitHubSignInButton compact />
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-24 top-16 size-72 rounded-full bg-[#cfe8b8]/50 blur-3xl sm:size-96"
        />
        <div
          aria-hidden="true"
          className="absolute -left-32 bottom-0 size-72 rounded-full bg-[#f4c95d]/15 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-[1.02fr_0.98fr] md:py-24 lg:gap-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center md:mx-0 md:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cfe0c4] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#315e12] shadow-sm sm:text-sm">
              <Recycle aria-hidden="true" className="size-4" />
              Small cleanups. Visible impact.
            </div>
            <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-[-0.045em] text-[#17230f] sm:text-5xl lg:text-6xl">
              Turn cleaner streets into{" "}
              <span className="text-[#4f861f]">real rewards.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-[#53604c] sm:mt-6 sm:text-lg sm:leading-8 md:mx-0">
              CleanKart helps you document local cleanups, earn points for verified
              impact, and connect with community drives making neighborhoods better.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center md:justify-start">
              <GitHubSignInButton />
              <Link
                href="#how-it-works"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#cbd9c2] bg-white px-6 text-sm font-semibold text-[#315e12] transition-colors duration-200 hover:bg-[#edf5e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#639922] focus-visible:ring-offset-2"
              >
                See how it works
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-[#667160] sm:text-sm md:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Check aria-hidden="true" className="size-4 text-[#4f861f]" />
                Free to join
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck aria-hidden="true" className="size-4 text-[#4f861f]" />
                Secure GitHub sign-in
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]">
            <div className="absolute -inset-4 rotate-2 rounded-[2.25rem] bg-[#dceccb] sm:-inset-6" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#d6e2cf] bg-white p-4 shadow-[0_24px_70px_rgba(49,94,18,0.16)] sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#74806e]">
                    Your impact
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#244b0d] sm:text-xl">
                    A cleaner city starts here
                  </p>
                </div>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-[#e8f3dc] text-[#3f7418]">
                  <Leaf aria-hidden="true" className="size-5" />
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-[#315e12] p-4 text-white sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#c8e5b0]">Next action</p>
                    <p className="mt-1 font-semibold">Start a cleanup</p>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/12">
                    <Camera aria-hidden="true" className="size-5" />
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-2/3 rounded-full bg-[#b9df91]" />
                </div>
                <p className="mt-2 text-xs text-[#c8e5b0]">
                  Capture before and after photos to verify your impact.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e0e8db] bg-[#fbfcfa] p-4">
                  <Trophy aria-hidden="true" className="size-5 text-[#d39520]" />
                  <p className="mt-5 text-sm font-bold text-[#244b0d]">Leaderboard</p>
                  <p className="mt-1 text-xs leading-5 text-[#667160]">
                    Celebrate consistent local action.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e0e8db] bg-[#fbfcfa] p-4">
                  <UsersRound aria-hidden="true" className="size-5 text-[#4f861f]" />
                  <p className="mt-5 text-sm font-bold text-[#244b0d]">Community</p>
                  <p className="mt-1 text-xs leading-5 text-[#667160]">
                    Find drives and join neighbors.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#e0e8db] p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff6db] text-[#bd7b08]">
                  <MapPin aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#244b0d]">
                    Add your cleanup location
                  </p>
                  <p className="mt-0.5 text-xs text-[#667160]">
                    Make every contribution visible.
                  </p>
                </div>
                <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-[#639922]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#4f861f]">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#17230f] sm:text-4xl">
              From good intention to visible action
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5d6857]">
              A focused flow keeps the effort on the cleanup—not on learning another
              complicated app.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
            {STEPS.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-[#dfe8d9] bg-[#f8faf6] p-6 sm:p-7"
              >
                <span className="text-sm font-bold tracking-[0.16em] text-[#639922]">
                  {step.number}
                </span>
                <h3 className="mt-8 text-xl font-bold text-[#244b0d]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5d6857] sm:text-base">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#4f861f]">
                Built for momentum
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#17230f] sm:text-4xl">
                Everything you need to keep showing up
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#5d6857]">
                CleanKart brings cleanup proof, progress, community, and rewards into
                one friendly mobile experience.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="rounded-3xl border border-[#dfe8d9] bg-white p-6 shadow-[0_12px_36px_rgba(49,94,18,0.06)] sm:p-7"
                  >
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e8f3dc] text-[#3f7418]">
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <h3 className="mt-6 text-lg font-bold text-[#244b0d]">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5d6857] sm:text-base">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#244b0d] px-5 py-10 text-center text-white shadow-[0_24px_70px_rgba(36,75,13,0.2)] sm:px-10 sm:py-14 lg:px-16">
          <Leaf aria-hidden="true" className="mx-auto size-9 text-[#b9df91]" />
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            Your next cleanup can start today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#d9ebca] sm:text-base sm:leading-7">
            Sign in securely with GitHub, document your first cleanup, and begin
            building a cleaner neighborhood.
          </p>
          <div className="mt-7 flex justify-center">
            <GitHubSignInButton className="bg-black text-[#244b0d] hover:bg-[#eff7e9] focus-visible:ring-white focus-visible:ring-offset-[#244b0d]" />
          </div>
        </div>
      </section>

      <footer className="border-t border-[#dfe9d8] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-7 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <div className="flex items-center gap-2 font-bold text-[#244b0d]">
            <Image
              src="/logo.png"
              alt="CleanKart"
              width={100}
              height={44}
              className="h-6 w-auto object-contain"
            />
          </div>
          <p className="text-xs text-[#667160] sm:text-sm">
            Clean your city. Earn rewards. Grow community impact.
          </p>
        </div>
      </footer>
    </div>
  );
}
