"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  brand: string;
  icon: string;
}

interface Redemption {
  id: string;
  createdAt: string;
  reward: Reward;
}

export default function RewardsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchRewards();
  }, [status]);

  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/rewards");
      const data = await res.json();
      setRewards(data.rewards || []);
      setUserPoints(data.userPoints || 0);
      setRedemptions(data.redemptions || []);
    } catch {
      console.error("Failed to fetch rewards");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleRedeem = async (reward: Reward) => {
    if (userPoints < reward.points) return;
    setRedeeming(reward.id);
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: reward.id }),
      });
      const data = await res.json();
      if (data.success) {
        setUserPoints(data.remainingPoints);
        showToast(`${reward.name} redeemed successfully!`);
        fetchRewards();
      } else {
        showToast("Failed to redeem. Try again!");
      }
    } catch {
      showToast("Something went wrong!");
    } finally {
      setRedeeming(null);
    }
  };

  const BRAND_ICONS: Record<string, string> = {
    Amazon: "ti-brand-amazon",
    Swiggy: "ti-motorbike",
    Dominos: "ti-pizza",
    Zomato: "ti-chef-hat",
    Paytm: "ti-wallet",
    CleanKart: "ti-plant",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf6] flex items-center justify-center">
        <div className="text-center">
          <i className="ti ti-gift text-[#639922] text-4xl"></i>
          <p className="text-[#639922] mt-2 text-sm">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf6] px-4 py-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#3B6D11] text-white px-5 py-2 rounded-full text-sm font-medium z-50 shadow-lg whitespace-nowrap flex items-center gap-2">
          <i className="ti ti-check text-sm"></i>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/home")}
          className="w-8 h-8 bg-white border border-[#e0ead8] rounded-lg flex items-center justify-center hover:bg-[#f4f9ef] transition-all"
        >
          <i className="ti ti-arrow-left text-[#3B6D11] text-sm"></i>
        </button>
        <h1 className="text-[#27500A] text-xl font-semibold">Rewards</h1>
      </div>

      {/* Points Balance */}
      <div className="bg-[#3B6D11] rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#97C459] text-xs mb-1">Your Balance</p>
            <div className="flex items-end gap-2">
              <p className="text-white text-4xl font-semibold">{userPoints}</p>
              <p className="text-[#97C459] text-sm mb-1">points</p>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <i className="ti ti-trophy text-white text-2xl"></i>
          </div>
        </div>
        <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#97C459] rounded-full transition-all duration-500"
            style={{ width: `${Math.min((userPoints / 500) * 100, 100)}%` }}
          />
        </div>
        <p className="text-[#97C459] text-xs mt-2">
          {userPoints >= 500
            ? "You can redeem top rewards!"
            : `${500 - userPoints} more points for Amazon Gift Card`}
        </p>
      </div>

      {/* Rewards List */}
      <p className="text-[#888780] text-xs font-medium uppercase tracking-widest mb-3">
        Available Rewards
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {rewards.map((reward) => {
          const canRedeem = userPoints >= reward.points;
          return (
            <div
              key={reward.id}
              className={`bg-white rounded-2xl border transition-all ${
                canRedeem ? "border-[#e0ead8]" : "border-[#f0f0ee] opacity-60"
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-xl bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
                  <i className={`ti ${BRAND_ICONS[reward.brand] || "ti-gift"} text-[#3B6D11] text-2xl`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#27500A] font-semibold text-sm">{reward.name}</p>
                  <p className="text-[#888780] text-xs mt-0.5">{reward.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-[#EAF3DE] text-[#3B6D11] text-xs font-medium px-2 py-0.5 rounded-full">
                      {reward.points} pts
                    </span>
                    <span className="text-[#B4B2A9] text-xs">{reward.brand}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canRedeem || redeeming === reward.id}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    canRedeem
                      ? "bg-[#639922] hover:bg-[#3B6D11] text-white"
                      : "bg-[#f0f0ee] text-[#B4B2A9] cursor-not-allowed"
                  }`}
                >
                  {redeeming === reward.id ? (
                    <i className="ti ti-loader-2 animate-spin"></i>
                  ) : canRedeem ? "Redeem" : (
                    <i className="ti ti-lock text-xs"></i>
                  )}
                </button>
              </div>
              {canRedeem && (
                <div className="h-px bg-gradient-to-r from-[#EAF3DE] via-[#639922]/20 to-transparent mx-4" />
              )}
            </div>
          );
        })}
      </div>

      {/* Redemption History */}
      {redemptions.length > 0 && (
        <>
          <p className="text-[#888780] text-xs font-medium uppercase tracking-widest mb-3">
            Redemption History
          </p>
          <div className="flex flex-col gap-2">
            {redemptions.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-[#e0ead8] rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#EAF3DE] rounded-lg flex items-center justify-center">
                    <i className={`ti ${BRAND_ICONS[r.reward.brand] || "ti-gift"} text-[#3B6D11] text-sm`}></i>
                  </div>
                  <div>
                    <p className="text-[#27500A] text-sm font-medium">{r.reward.name}</p>
                    <p className="text-[#888780] text-xs">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-red-400 font-medium text-sm">-{r.reward.points} pts</p>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-[#B4B2A9] text-xs text-center mt-6 mb-4">
        Complete cleanups to earn more points
      </p>
    </div>
  );
}