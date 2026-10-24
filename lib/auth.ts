import type { DefaultSession, NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { getRequiredServerEnv } from "@/lib/env";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  secret: getRequiredServerEnv("NEXTAUTH_SECRET"),
  providers: [
    GithubProvider({
      clientId: getRequiredServerEnv("GITHUB_CLIENT_ID"),
      clientSecret: getRequiredServerEnv("GITHUB_CLIENT_SECRET"),
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
      }
      return session;
    },
  },
};
