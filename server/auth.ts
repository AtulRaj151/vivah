
import { Auth } from "@auth/core";
import Google from "@auth/core/providers/google";
import { expressHandler } from "@auth/express";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("Missing Google OAuth credentials");
}

export const authHandler = expressHandler(Auth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.AUTH_SECRET || "default-secret-key",
  trustHost: true,
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
}));
