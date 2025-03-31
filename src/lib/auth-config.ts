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
      clientId: process.env.API_KEY!,
      clientSecret: process.env.API_KEY_AUTH_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  debug: false,
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const twitterProfile = profile as {
          id_str: string;
          screen_name: string;
          name: string;
          profile_image_url_https?: string;
        };
        token.id = twitterProfile.id_str;
        token.username = twitterProfile.screen_name;
        token.name = twitterProfile.name;
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