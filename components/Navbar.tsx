"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Camera,
  Gift,
  Home,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

const NAV_ITEMS: { icon: LucideIcon; label: string; path: string }[] = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Camera, label: "Cleanup", path: "/capture" },
  { icon: UsersRound, label: "Community", path: "/community" },
  { icon: Gift, label: "Rewards", path: "/rewards" },
  { icon: UserRound, label: "Profile", path: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { status } = useSession();

  if (pathname === "/" || pathname === "/login" || status !== "authenticated") {
    return null;
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dce7d4] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(39,80,10,0.08)] backdrop-blur-xl sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-[min(calc(100%-2rem),44rem)] sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:px-3 sm:pb-2"
    >
      <div className="mx-auto flex max-w-2xl items-center justify-around gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-12 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#639922] sm:flex-row sm:gap-2 sm:px-3 ${
                isActive
                  ? "bg-[#e8f3dc] text-[#315e12]"
                  : "text-[#626a5d] hover:bg-[#f1f6ed] hover:text-[#315e12]"
              }`}
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={2} />
              <span className="truncate text-[0.69rem] font-semibold sm:text-xs">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
