"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

interface GitHubSignInButtonProps {
  compact?: boolean;
  className?: string;
}

function GitHubMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 .7C5.7.7.6 5.9.6 12.3c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.1 1.2a10.6 10.6 0 0 1 5.7 0C17 4.8 18 5.1 18 5.1c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.1v3.4c0 .3.2.7.8.6a11.5 11.5 0 0 0 7.8-10.9C23.4 5.9 18.3.7 12 .7Z" />
    </svg>
  );
}

export default function GitHubSignInButton({
  compact = false,
  className = "",
}: GitHubSignInButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSignIn = async () => {
    setIsRedirecting(true);
    await signIn("github", { callbackUrl: "/home" });
    setIsRedirecting(false);
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isRedirecting}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#17230f] font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#26391b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#639922] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 ${
        compact ? "min-h-11 px-4 text-sm sm:px-5" : "min-h-12 w-full px-6 text-sm sm:w-auto"
      } ${className}`}
    >
      <GitHubMark />
      {isRedirecting ? "Opening GitHub…" : compact ? "Log in" : "Continue with GitHub"}
    </button>
  );
}
