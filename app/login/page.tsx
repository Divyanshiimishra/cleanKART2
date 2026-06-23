"use client";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/home");
  }, [session, router]);

  return (
    <div className="min-h-screen bg-[#f8faf6] flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-[#3B6D11] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i className="ti ti-leaf text-white text-3xl"></i>
        </div>
        <h1 className="text-2xl font-semibold text-[#27500A] mb-1">CleanKart</h1>
        <p className="text-[#888780] text-sm">Clean India, Earn Rewards</p>
      </div>

      {/* Card */}
      <div className="bg-white border border-[#e0ead8] rounded-2xl p-8 w-full max-w-sm shadow-sm">

        <h2 className="text-[#27500A] text-xl font-semibold mb-1 text-center">
          Welcome back
        </h2>
        <p className="text-[#888780] text-sm text-center mb-8">
          Sign in to start earning points
        </p>

        {/* GitHub Login Button */}
        <button
          onClick={() => signIn("github", { callbackUrl: "/home" })}
          className="w-full bg-[#24292e] hover:bg-[#1a1e22] text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-3"
        >
          <i className="ti ti-brand-github text-xl"></i>
          Continue with GitHub
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#e0ead8]"></div>
          <span className="text-[#888780] text-xs">or</span>
          <div className="flex-1 h-px bg-[#e0ead8]"></div>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-3">
          {[
            { icon: "ti-camera", text: "Capture before & after photos" },
            { icon: "ti-star", text: "Earn points for every cleanup" },
            { icon: "ti-gift", text: "Redeem rewards & vouchers" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#EAF3DE] rounded-lg flex items-center justify-center flex-shrink-0">
                <i className={`ti ${item.icon} text-[#3B6D11] text-sm`}></i>
              </div>
              <p className="text-[#5F5E5A] text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-[#888780] text-xs mt-8 text-center">
        By continuing, you agree to CleanKart's Terms of Service
      </p>
    </div>
  );
}