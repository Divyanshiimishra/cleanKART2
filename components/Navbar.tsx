"use client";

import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: "ti-home", label: "Home", path: "/home" },
  { icon: "ti-camera", label: "Cleanup", path: "/capture" },
  { icon: "ti-users", label: "Community", path: "/community" },
  { icon: "ti-gift", label: "Rewards", path: "/rewards" },
  { icon: "ti-user", label: "Profile", path: "/profile" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0ead8] px-2 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? "bg-[#EAF3DE]" : "hover:bg-[#f4f9ef]"
              }`}
            >
              <i className={`ti ${item.icon} text-xl ${isActive ? "text-[#3B6D11]" : "text-[#888780]"}`}></i>
              <span className={`text-xs font-medium ${isActive ? "text-[#3B6D11]" : "text-[#888780]"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}