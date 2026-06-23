"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Community {
  id: string;
  name: string;
  description: string;
  organizer: string;
  location: string;
  date: string;
  members: number;
  isJoined: boolean;
}

export default function CommunityPage() {
  const { status } = useSession();
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDonateModal, setShowDonateModal] = useState<Community | null>(null);
  const [donatePoints, setDonatePoints] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchCommunities();
  }, [status]);

  const fetchCommunities = async () => {
    try {
      const res = await fetch("/api/community");
      const data = await res.json();
      setCommunities(data.communities || []);
      setUserPoints(data.userPoints || 0);
    } catch {
      console.error("Failed to fetch communities");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleJoin = async (community: Community) => {
    setActionLoading(community.id);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: community.id,
          action: community.isJoined ? "leave" : "join",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.action === "joined" ? `Joined ${community.name}!` : `Left ${community.name}`);
        fetchCommunities();
      }
    } catch {
      showToast("Something went wrong!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDonate = async () => {
    if (!showDonateModal) return;
    const pts = parseInt(donatePoints);
    if (!pts || pts <= 0 || pts > userPoints) return;
    setActionLoading(showDonateModal.id);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: showDonateModal.id,
          action: "donate",
          donatePoints: pts,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUserPoints(data.remainingPoints);
        showToast(`${pts} points donated to ${showDonateModal.name}!`);
        setShowDonateModal(null);
        setDonatePoints("");
        fetchCommunities();
      }
    } catch {
      showToast("Something went wrong!");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const ICONS = ["ti-trees", "ti-waves", "ti-building", "ti-garden-cart", "ti-ripple"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf6] flex items-center justify-center">
        <div className="text-center">
          <i className="ti ti-users text-[#639922] text-4xl"></i>
          <p className="text-[#639922] mt-2 text-sm">Loading drives...</p>
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
        <h1 className="text-[#27500A] text-xl font-semibold">Community Drives</h1>
      </div>

      {/* Register NGO Button */}
      <button
        onClick={() => router.push("/register-ngo")}
        className="w-full bg-white border border-[#e0ead8] hover:border-[#639922] rounded-2xl p-4 flex items-center gap-3 mb-6 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
          <i className="ti ti-building-community text-[#3B6D11] text-xl"></i>
        </div>
        <div className="text-left">
          <p className="text-[#27500A] font-semibold text-sm">Register Your Organization</p>
          <p className="text-[#888780] text-xs mt-0.5">NGOs & community groups can list their drives here</p>
        </div>
        <i className="ti ti-chevron-right text-[#639922] ml-auto"></i>
      </button>

      {/* Points Balance */}
      <div className="bg-[#3B6D11] rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-[#97C459] text-xs mb-1">Your Points</p>
          <p className="text-white text-2xl font-semibold">{userPoints}</p>
          <p className="text-[#97C459] text-xs mt-1">Available to donate</p>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
          <i className="ti ti-trophy text-white text-2xl"></i>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-white border border-[#e0ead8] rounded-xl p-3 text-center">
          <p className="text-[#27500A] text-xl font-semibold">{communities.length}</p>
          <p className="text-[#888780] text-xs mt-1">Active Drives</p>
        </div>
        <div className="bg-white border border-[#e0ead8] rounded-xl p-3 text-center">
          <p className="text-[#27500A] text-xl font-semibold">
            {communities.filter((c) => c.isJoined).length}
          </p>
          <p className="text-[#888780] text-xs mt-1">Joined</p>
        </div>
        <div className="bg-white border border-[#e0ead8] rounded-xl p-3 text-center">
          <p className="text-[#27500A] text-xl font-semibold">
            {communities.reduce((acc, c) => acc + c.members, 0)}
          </p>
          <p className="text-[#888780] text-xs mt-1">Members</p>
        </div>
      </div>

      {/* Communities List */}
      <p className="text-[#888780] text-xs font-medium uppercase tracking-widest mb-3">
        Active Drives
      </p>

      {communities.length === 0 ? (
        <div className="bg-white border border-[#e0ead8] rounded-2xl p-6 text-center">
          <i className="ti ti-plant text-[#639922] text-3xl"></i>
          <p className="text-[#27500A] font-semibold mt-2 mb-1">No drives yet!</p>
          <p className="text-[#888780] text-sm mb-4">Be the first to register a community drive!</p>
          <button
            onClick={() => router.push("/register-ngo")}
            className="bg-[#639922] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#3B6D11] transition-all"
          >
            Register a Drive
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {communities.map((community, index) => (
            <div
              key={community.id}
              className={`bg-white rounded-2xl overflow-hidden border transition-all ${
                community.isJoined ? "border-[#639922]" : "border-[#e0ead8]"
              }`}
            >
              {community.isJoined && (
                <div className="h-1 bg-[#639922]" />
              )}
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
                    <i className={`ti ${ICONS[index % ICONS.length]} text-[#3B6D11] text-2xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[#27500A] font-semibold text-sm">{community.name}</h3>
                      {community.isJoined && (
                        <span className="bg-[#EAF3DE] text-[#3B6D11] text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <i className="ti ti-check text-xs"></i> Joined
                        </span>
                      )}
                    </div>
                    <p className="text-[#888780] text-xs mt-0.5">{community.organizer}</p>
                  </div>
                </div>

                <p className="text-[#5F5E5A] text-sm mb-3 leading-relaxed">{community.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="flex items-center gap-1 bg-[#f8faf6] text-[#5F5E5A] text-xs px-2 py-1 rounded-full border border-[#e0ead8]">
                    <i className="ti ti-map-pin text-[#639922] text-xs"></i>
                    {community.location}
                  </span>
                  <span className="flex items-center gap-1 bg-[#f8faf6] text-[#5F5E5A] text-xs px-2 py-1 rounded-full border border-[#e0ead8]">
                    <i className="ti ti-calendar text-[#639922] text-xs"></i>
                    {formatDate(community.date)}
                  </span>
                  <span className="flex items-center gap-1 bg-[#f8faf6] text-[#5F5E5A] text-xs px-2 py-1 rounded-full border border-[#e0ead8]">
                    <i className="ti ti-users text-[#639922] text-xs"></i>
                    {community.members} members
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleJoin(community)}
                    disabled={actionLoading === community.id}
                    className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                      community.isJoined
                        ? "border border-[#e0ead8] text-[#888780] hover:bg-[#f8faf6]"
                        : "bg-[#639922] hover:bg-[#3B6D11] text-white"
                    }`}
                  >
                    {actionLoading === community.id ? (
                      <i className="ti ti-loader-2 animate-spin"></i>
                    ) : community.isJoined ? "Leave" : "Join Drive"}
                  </button>
                  {community.isJoined && (
                    <button
                      onClick={() => setShowDonateModal(community)}
                      className="flex-1 py-2.5 rounded-full text-sm font-medium border border-[#639922] text-[#639922] hover:bg-[#EAF3DE] transition-all flex items-center justify-center gap-1.5"
                    >
                      <i className="ti ti-heart text-sm"></i>
                      Donate Points
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[#B4B2A9] text-xs text-center mt-6 mb-4">
        Join a drive and make a difference!
      </p>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div className="bg-white border border-[#e0ead8] rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#27500A] text-lg font-semibold">Donate Points</h3>
              <button
                onClick={() => { setShowDonateModal(null); setDonatePoints(""); }}
                className="w-8 h-8 bg-[#f8faf6] rounded-lg flex items-center justify-center"
              >
                <i className="ti ti-x text-[#888780] text-sm"></i>
              </button>
            </div>

            <p className="text-[#888780] text-sm mb-4">
              Donating to <span className="text-[#3B6D11] font-medium">{showDonateModal.name}</span>
            </p>

            <div className="bg-[#EAF3DE] rounded-xl p-3 mb-4 text-center">
              <p className="text-[#639922] text-xs mb-1">Available Points</p>
              <p className="text-[#27500A] text-3xl font-semibold">{userPoints}</p>
            </div>

            <p className="text-[#888780] text-xs mb-2 font-medium">Quick Select</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[10, 25, 50, 100].map((pts) => (
                <button
                  key={pts}
                  onClick={() => setDonatePoints(pts.toString())}
                  disabled={pts > userPoints}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${
                    donatePoints === pts.toString()
                      ? "bg-[#639922] text-white"
                      : pts > userPoints
                      ? "bg-[#f5f5f5] text-[#B4B2A9] cursor-not-allowed"
                      : "bg-[#f8faf6] text-[#5F5E5A] hover:bg-[#EAF3DE] border border-[#e0ead8]"
                  }`}
                >
                  {pts}
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder="Custom amount"
              value={donatePoints}
              onChange={(e) => setDonatePoints(e.target.value)}
              max={userPoints}
              className="w-full bg-[#f8faf6] border border-[#e0ead8] rounded-xl px-4 py-3 text-[#27500A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#639922] mb-4 text-sm"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDonateModal(null); setDonatePoints(""); }}
                className="flex-1 border border-[#e0ead8] text-[#888780] py-3 rounded-full text-sm font-medium hover:bg-[#f8faf6]"
              >
                Cancel
              </button>
              <button
                onClick={handleDonate}
                disabled={!donatePoints || parseInt(donatePoints) <= 0 || parseInt(donatePoints) > userPoints || !!actionLoading}
                className="flex-1 bg-[#639922] hover:bg-[#3B6D11] disabled:opacity-40 text-white font-medium py-3 rounded-full text-sm transition-all"
              >
                {actionLoading ? "Donating..." : "Donate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}