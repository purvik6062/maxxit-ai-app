"use client";
import { Providers } from "./providers";
import { CreditsProvider } from "@/context/CreditsContext";
import "./globals.css";
import Head from "next/head";
import { MainHeader } from "@/components";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <div className="techwave_fn_wrapper">
            <div className="techwave_fn_wrap">
              <CreditsProvider>
                <MainHeader />
                {children}
              </CreditsProvider>
            </div>
          </div>
          <script type="text/javascript" src="js/jquery.js?ver=1.0.0"></script>
          <script type="text/javascript" src="js/plugins.js?ver=1.0.0"></script>
          <script type="text/javascript" src="js/init.js?ver=1.0.0"></script>
        </Providers>
      </body>
    </html>
  );
}
