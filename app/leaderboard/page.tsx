"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LeaderboardUser {
  id: string;
  name: string;
  image: string;
  points: number;
  city: string;
  cleanups: number;
  rank: number;
}

interface LeaderboardData {
  topUsers: LeaderboardUser[];
  currentUser: LeaderboardUser & { rank: number } | null;
}

export default function LeaderboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchLeaderboard();
  }, [status]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      setData(json);
    } catch {
      console.error("Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf6] flex items-center justify-center">
        <div className="text-center">
          <i className="ti ti-trophy text-[#639922] text-4xl"></i>
          <p className="text-[#639922] mt-2 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const topUsers = data?.topUsers || [];
  const currentUser = data?.currentUser;
  const top3 = [topUsers[1], topUsers[0], topUsers[2]].filter(Boolean);

  const RANK_COLORS = ["#C0C0C0", "#FFD700", "#CD7F32"];
  const RANK_BG = ["#f5f5f5", "#fffbea", "#fff5ee"];

  return (
    <div className="min-h-screen bg-[#f8faf6] px-4 py-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/home")}
          className="w-8 h-8 bg-white border border-[#e0ead8] rounded-lg flex items-center justify-center hover:bg-[#f4f9ef] transition-all"
        >
          <i className="ti ti-arrow-left text-[#3B6D11] text-sm"></i>
        </button>
        <h1 className="text-[#27500A] text-xl font-semibold">Leaderboard</h1>
      </div>

      {/* Your Rank Card */}
      {currentUser && (
        <div className="bg-[#3B6D11] rounded-2xl p-5 mb-6">
          <p className="text-[#97C459] text-xs mb-3">Your Position</p>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-white text-3xl font-semibold">#{currentUser.rank}</p>
              <p className="text-[#97C459] text-xs mt-1">Rank</p>
            </div>
            <div className="flex-1">
              {currentUser.image ? (
                <img src={currentUser.image} alt="You" className="w-9 h-9 rounded-full mb-1 border-2 border-white/20" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-1">
                  <span className="text-white text-sm font-semibold">{currentUser.name[0]}</span>
                </div>
              )}
              <p className="text-white font-semibold text-sm">{currentUser.name}</p>
              <p className="text-[#97C459] text-lg font-semibold">{currentUser.points} pts</p>
              <p className="text-[#97C459]/70 text-xs">{currentUser.cleanups} cleanups</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <>
          <p className="text-[#888780] text-xs font-medium uppercase tracking-widest mb-3">Top 3</p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {top3.map((user, i) => {
              const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
              return (
                <div
                  key={user.id}
                  className="rounded-2xl p-3 text-center border border-[#e0ead8]"
                  style={{ backgroundColor: RANK_BG[actualRank - 1] }}
                >
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full mx-auto mb-2" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold mx-auto mb-2 text-sm"
                      style={{ backgroundColor: RANK_COLORS[actualRank - 1] + "33", color: RANK_COLORS[actualRank - 1] }}
                    >
                      {user.name[0]}
                    </div>
                  )}
                  <i className="ti ti-medal text-lg" style={{ color: RANK_COLORS[actualRank - 1] }}></i>
                  <p className="text-[#27500A] text-xs font-semibold truncate mt-1">{user.name}</p>
                  <p className="text-[#639922] text-xs font-medium">{user.points} pts</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Full List */}
      <p className="text-[#888780] text-xs font-medium uppercase tracking-widest mb-3">
        Top Cleaners
      </p>

      {topUsers.length === 0 ? (
        <div className="bg-white border border-[#e0ead8] rounded-2xl p-6 text-center">
          <i className="ti ti-plant text-[#639922] text-3xl"></i>
          <p className="text-[#27500A] font-semibold mt-2 mb-1">No cleanups yet!</p>
          <p className="text-[#888780] text-sm">Be the first to complete a cleanup!</p>
          <button
            onClick={() => router.push("/capture")}
            className="mt-4 bg-[#639922] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#3B6D11] transition-all"
          >
            Start Cleanup
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {topUsers.map((user) => (
            <div
              key={user.id}
              className={`border rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
                currentUser?.id === user.id
                  ? "bg-[#EAF3DE] border-[#639922]"
                  : "bg-white border-[#e0ead8]"
              }`}
            >
              <p className="font-semibold text-sm w-6 text-center flex-shrink-0"
                style={{ color: user.rank <= 3 ? RANK_COLORS[user.rank - 1] : "#888780" }}
              >
                {user.rank <= 3 ? (
                  <i className="ti ti-medal"></i>
                ) : user.rank}
              </p>
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#EAF3DE] flex items-center justify-center font-semibold text-sm flex-shrink-0 text-[#3B6D11]">
                  {user.name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[#27500A] text-sm font-medium truncate">
                  {user.name}
                  {currentUser?.id === user.id && (
                    <span className="text-[#639922] text-xs ml-1">(You)</span>
                  )}
                </p>
                <p className="text-[#888780] text-xs">{user.city} · {user.cleanups} cleanups</p>
              </div>
              <p className="text-[#639922] font-semibold text-sm flex-shrink-0">
                {user.points} pts
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-[#B4B2A9] text-xs text-center mt-6 mb-4">
        Do more cleanups to climb the leaderboard!
      </p>
    </div>
  );
}