"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserData {
  points: number;
  cleanups: number;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({ points: 0, cleanups: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) fetchUserData();
  }, [session]);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUserData({ points: data.points || 0, cleanups: data.cleanups || 0 });
    } catch {
      console.error("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#f8faf6] flex items-center justify-center">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="CleanKart"
            width={120}
            height={53}
            className="h-10 w-auto object-contain mx-auto animate-pulse"
          />
          <p className="text-[#639922] mt-3 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf6] px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="CleanKart"
            width={120}
            height={53}
            className="h-8 w-auto object-contain"
            priority
          />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1.5 text-[#888780] text-sm border border-[#e0ead8] px-3 py-1.5 rounded-full hover:bg-white transition-all"
        >
          <i className="ti ti-logout text-sm"></i>
          Logout
        </button>
      </div>

      {/* Hero Card */}
      <div className="bg-[#3B6D11] rounded-2xl p-5 mb-6">
        <p className="text-[#97C459] text-xs mb-1">Welcome back,</p>
        <h2 className="text-white text-xl font-semibold mb-4">
          {session?.user?.name}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white text-2xl font-semibold">{userData.points}</p>
            <p className="text-[#97C459] text-xs mt-1">Total Points</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white text-2xl font-semibold">{userData.cleanups}</p>
            <p className="text-[#97C459] text-xs mt-1">Cleanups Done</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <p className="text-[#888780] text-xs font-medium uppercase tracking-widest mb-3">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => router.push("/capture")}
          className="bg-white border border-[#e0ead8] rounded-2xl p-4 text-left hover:border-[#639922] hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-[#EAF3DE] rounded-xl flex items-center justify-center mb-3">
            <i className="ti ti-camera text-[#3B6D11] text-xl"></i>
          </div>
          <p className="text-[#27500A] font-semibold text-sm">Start Cleanup</p>
          <p className="text-[#888780] text-xs mt-1">Earn 50+ points</p>
        </button>
        <button
          onClick={() => router.push("/rewards")}
          className="bg-white border border-[#e0ead8] rounded-2xl p-4 text-left hover:border-[#639922] hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-[#EAF3DE] rounded-xl flex items-center justify-center mb-3">
            <i className="ti ti-gift text-[#3B6D11] text-xl"></i>
          </div>
          <p className="text-[#27500A] font-semibold text-sm">Rewards</p>
          <p className="text-[#888780] text-xs mt-1">Redeem points</p>
        </button>
        <button
          onClick={() => router.push("/leaderboard")}
          className="bg-white border border-[#e0ead8] rounded-2xl p-4 text-left hover:border-[#639922] hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-[#EAF3DE] rounded-xl flex items-center justify-center mb-3">
            <i className="ti ti-trophy text-[#3B6D11] text-xl"></i>
          </div>
          <p className="text-[#27500A] font-semibold text-sm">Leaderboard</p>
          <p className="text-[#888780] text-xs mt-1">Top cleaners</p>
        </button>
        <button
          onClick={() => router.push("/profile")}
          className="bg-white border border-[#e0ead8] rounded-2xl p-4 text-left hover:border-[#639922] hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-[#EAF3DE] rounded-xl flex items-center justify-center mb-3">
            <i className="ti ti-user text-[#3B6D11] text-xl"></i>
          </div>
          <p className="text-[#27500A] font-semibold text-sm">Profile</p>
          <p className="text-[#888780] text-xs mt-1">Your stats</p>
        </button>
        <button
          onClick={() => router.push("/community")}
          className="bg-white border border-[#e0ead8] rounded-2xl p-4 text-left hover:border-[#639922] hover:shadow-sm transition-all col-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EAF3DE] rounded-xl flex items-center justify-center">
              <i className="ti ti-users text-[#3B6D11] text-xl"></i>
            </div>
            <div>
              <p className="text-[#27500A] font-semibold text-sm">Community Drives</p>
              <p className="text-[#888780] text-xs mt-0.5">Join NGOs & earn together</p>
            </div>
            <i className="ti ti-chevron-right text-[#639922] ml-auto"></i>
          </div>
        </button>
      </div>

      {/* Recent Activity */}
      <p className="text-[#888780] text-xs font-medium uppercase tracking-widest mb-3">
        Recent Activity
      </p>
      <div className="bg-white border border-[#e0ead8] rounded-2xl p-5">
        {userData.cleanups === 0 ? (
          <div className="text-center py-4">
            <i className="ti ti-plant text-[#639922] text-3xl"></i>
            <p className="text-[#888780] text-sm mt-2">
              No cleanups yet — start your first one!
            </p>
            <button
              onClick={() => router.push("/capture")}
              className="mt-3 bg-[#639922] text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-[#3B6D11] transition-all"
            >
              Start Now
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <i className="ti ti-check text-[#639922] text-xl"></i>
            <p className="text-[#27500A] text-sm">
              You have completed {userData.cleanups} cleanup{userData.cleanups > 1 ? "s" : ""}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}