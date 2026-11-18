"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserData {
  name: string;
  email: string;
  image: string;
  points: number;
  cleanups: number;
  recentCleanups: {
    id: string;
    location: string;
    points: number;
    createdAt: string;
  }[];
}

const BADGES = [
  { icon: "ti-plant", label: "First Cleanup", requirement: 1, points: 0 },
  { icon: "ti-star", label: "10 Cleanups", requirement: 10, points: 0 },
  { icon: "ti-trophy", label: "50 Cleanups", requirement: 50, points: 0 },
  { icon: "ti-diamond", label: "100 Cleanups", requirement: 100, points: 0 },
  { icon: "ti-coin", label: "500 Points", requirement: 0, points: 500 },
  { icon: "ti-crown", label: "1000 Points", requirement: 0, points: 1000 },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchUserData();
  }, [session]);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUserData(data);
    } catch {
      console.error("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const hasBadge = (badge: typeof BADGES[0]) => {
    if (!userData) return false;
    if (badge.points) return userData.points >= badge.points;
    return userData.cleanups >= badge.requirement;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf6] flex items-center justify-center">
        <div className="text-center">
          <i className="ti ti-user text-[#639922] text-4xl"></i>
          <p className="text-[#639922] mt-2 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf6] px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/home")}
            className="w-8 h-8 bg-white border border-[#e0ead8] rounded-lg flex items-center justify-center hover:bg-[#f4f9ef] transition-all"
          >
            <i className="ti ti-arrow-left text-[#3B6D11] text-sm"></i>
          </button>
          <h1 className="text-[#27500A] text-xl font-semibold">Profile</h1>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1.5 text-red-400 text-sm border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition-all"
        >
          <i className="ti ti-logout text-sm"></i>
          Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-[#e0ead8] rounded-2xl p-5 mb-4 text-center">
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt="Profile"
            className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-[#EAF3DE]"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#EAF3DE] flex items-center justify-center mx-auto mb-3 border-2 border-[#639922]/20">
            <span className="text-[#3B6D11] text-3xl font-semibold">
              {session?.user?.name?.[0] || "U"}
            </span>
          </div>
        )}
        <h2 className="text-[#27500A] text-xl font-semibold">{session?.user?.name}</h2>
        <p className="text-[#888780] text-sm mt-1">{session?.user?.email}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-[#EAF3DE] text-[#3B6D11] text-xs font-medium px-3 py-1 rounded-full">
          <Image
            src="/logo.png"
            alt="CleanKart"
            width={18}
            height={18}
            className="h-3.5 w-auto object-contain"
          />
          CleanKart Member
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-[#e0ead8] rounded-xl p-3 text-center">
          <p className="text-[#27500A] text-2xl font-semibold">{userData?.points || 0}</p>
          <p className="text-[#888780] text-xs mt-1">Points</p>
        </div>
        <div className="bg-white border border-[#e0ead8] rounded-xl p-3 text-center">
          <p className="text-[#27500A] text-2xl font-semibold">{userData?.cleanups || 0}</p>
          <p className="text-[#888780] text-xs mt-1">Cleanups</p>
        </div>
        <div className="bg-white border border-[#e0ead8] rounded-xl p-3 text-center">
          <p className="text-[#27500A] text-2xl font-semibold">
            {BADGES.filter((b) => hasBadge(b)).length}
          </p>
          <p className="text-[#888780] text-xs mt-1">Badges</p>
        </div>
      </div>

      {/* Badges */}
      <p className="text-[#888780] text-xs font-medium uppercase tracking-widest mb-3">
        Badges
      </p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {BADGES.map((badge, i) => {
          const earned = hasBadge(badge);
          return (
            <div
              key={i}
              className={`rounded-xl p-3 text-center border transition-all ${
                earned
                  ? "bg-white border-[#639922]/30"
                  : "bg-white border-[#e0ead8] opacity-40"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${earned ? "bg-[#EAF3DE]" : "bg-[#f5f5f5]"}`}>
                <i className={`ti ${badge.icon} text-xl ${earned ? "text-[#3B6D11]" : "text-[#B4B2A9]"}`}></i>
              </div>
              <p className={`text-xs font-medium ${earned ? "text-[#27500A]" : "text-[#B4B2A9]"}`}>
                {badge.label}
              </p>
              {earned && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <i className="ti ti-check text-[#639922] text-xs"></i>
                  <p className="text-[#639922] text-xs">Earned</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Cleanups */}
      <p className="text-[#888780] text-xs font-medium uppercase tracking-widest mb-3">
        Recent Cleanups
      </p>
      <div className="flex flex-col gap-2">
        {userData?.recentCleanups && userData.recentCleanups.length > 0 ? (
          userData.recentCleanups.map((cleanup) => (
            <div
              key={cleanup.id}
              className="bg-white border border-[#e0ead8] rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#EAF3DE] rounded-lg flex items-center justify-center">
                  <i className="ti ti-map-pin text-[#3B6D11] text-sm"></i>
                </div>
                <div>
                  <p className="text-[#27500A] text-sm font-medium">{cleanup.location}</p>
                  <p className="text-[#888780] text-xs mt-0.5">
                    {new Date(cleanup.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#EAF3DE] px-2 py-1 rounded-full">
                <i className="ti ti-plus text-[#3B6D11] text-xs"></i>
                <p className="text-[#3B6D11] font-semibold text-sm">{cleanup.points}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-[#e0ead8] rounded-xl p-5 text-center">
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
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-6 mb-4">
        <Image
          src="/logo.png"
          alt="CleanKart"
          width={80}
          height={36}
          className="h-4 w-auto object-contain opacity-60"
        />
        <span className="text-[#B4B2A9] text-xs">— Clean India, Earn Rewards</span>
      </div>
    </div>
  );
}