"use client";

import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = new Set(["/", "/login"]);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  return (
    <main
      id="main-content"
      className={
        isPublicRoute
          ? "min-h-screen"
          : "mx-auto min-h-screen w-full max-w-3xl bg-[#f8faf6] pb-24 shadow-[0_0_60px_rgba(39,80,10,0.06)] sm:border-x sm:border-[#dfe9d8] md:pb-28"
      }
    >
      {children}
    </main>
  );
}
