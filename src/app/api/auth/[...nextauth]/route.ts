// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

// Extend the Session interface to include id and username
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      id?: string | null;
      username?: string | null; // Twitter handle
      image?: string | null;
    };
  }
}

// Extend the JWT interface to include id and username
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
      clientSecret: process.env.API_KEY_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  debug: false,
  callbacks: {
    async jwt({ token, profile }) {
      // The profile object contains Twitter data from verify_credentials
      if (profile) {
        const twitterProfile = profile as {
          id_str: string;
          screen_name: string;
          name: string;
          profile_image_url_https?: string;
        };
        token.id = twitterProfile.id_str; // User ID
        token.username = twitterProfile.screen_name; // Twitter handle
        token.name = twitterProfile.name; // Display name
      }
      return token;
    },
    async session({ session, token }) {
      // Map token data to session.user
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.name = token.name;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };