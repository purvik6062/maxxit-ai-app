"use client";
import { Providers } from "./providers";
import { CreditsProvider } from "@/context/CreditsContext";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Footer } from "@/components";
import { League_Spartan } from "next/font/google";
import localFonts from "next/font/local";
import MainHeader from "@/components/Global/MainHeader";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-league-spartan",
  display: "swap",
});

const napzerRounded = localFonts({
  src: [
    {
      path: "../assets/fonts/NapzerRoundedDrawn.otf",
    },
  ],
  variable: "--font-napzer-rounded",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <title>Maxxit | App</title>
      <meta
        name="description"
        content="AI-Powered Signals Generator Platform"
      />
      <link rel="icon" type="image/svg+xml" href="/img/maxxit_icon.svg" />
      <body className={`${leagueSpartan.variable} ${napzerRounded.variable}`}>
        <Providers>
          <SessionProvider
            refetchInterval={0} // Disable automatic refetching
            refetchOnWindowFocus={false}
          >
            <CreditsProvider>
              <MainHeader />
              <main className="main-content">{children}</main>
              <Footer />
            </CreditsProvider>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
