import type { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      id?: string | null;
      username?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],
  secret: process.env.AUTH_SECRET,
  debug: false,
  callbacks: {
    async jwt({ token, profile, account }) {
      if (profile) {
        // With Twitter OAuth 2.0, the data structure is different
        const twitterProfile = profile as any;

        // Extract id and username from the profile object
        if (twitterProfile.data) {
          token.id = twitterProfile.data.id;
          token.username = twitterProfile.data.username;
          token.name = twitterProfile.data.name;
          if (twitterProfile.data.profile_image_url) {
            token.image = twitterProfile.data.profile_image_url.replace(/_normal(?=\.(jpg|jpeg|png|gif|webp))/i, "");
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.name = token.name;
      }
      return session;
    },
  },
};
