"use client";
import { Providers } from "./providers";
import { useState } from "react";
import { CreditsProvider } from "@/context/CreditsContext";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Header } from "@/components";
import { Footer } from "@/components";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchText, setSearchText] = useState("");
  return (
    <html lang="en">
      <title>CTxbt | App</title>
      <meta
        name="description"
        content="AI-Powered Signals Generator Platform"
      />
      <link rel="icon" type="image/svg+xml" href="/img/new_logo.svg" />
      <body>
        <Providers>
          <SessionProvider
            refetchInterval={0} // Disable automatic refetching
            refetchOnWindowFocus={false}
          >
            <CreditsProvider>
            {/* <Header searchText={searchText} setSearchText={setSearchText} /> */}
            <main className="main-content">
              {children}
              </main>
              {/* <Footer /> */}
            </CreditsProvider>
            <script
              type="text/javascript"
              src="js/jquery.js?ver=1.0.0"
            ></script>
            <script
              type="text/javascript"
              src="js/plugins.js?ver=1.0.0"
            ></script>
            <script type="text/javascript" src="js/init.js?ver=1.0.0"></script>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
