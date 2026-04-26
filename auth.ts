import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admissions" | "admin";
    } & DefaultSession["user"];
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const email =
          typeof raw?.email === "string" ? raw.email.toLowerCase().trim() : "";
        const password =
          typeof raw?.password === "string" ? raw.password : "";
        if (!email || !password) return null;

        const [user] = await db
          .select()
          .from(schema.teamMembers)
          .where(eq(schema.teamMembers.email, email))
          .limit(1);
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: "admissions" | "admin" }).role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admissions" | "admin";
      }
      return session;
    },
    authorized: ({ auth, request }) => {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const isPublic =
        path === "/login" ||
        path.startsWith("/api/auth") ||
        path.startsWith("/_next") ||
        path === "/favicon.ico";
      if (isPublic) return true;
      return isLoggedIn;
    },
  },
});
