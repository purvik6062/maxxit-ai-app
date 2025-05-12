"use client";
import { Providers } from "./providers";
import { CreditsProvider } from "@/context/CreditsContext";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Footer, Header } from "@/components";
import { League_Spartan } from "next/font/google";
import localFonts from "next/font/local";
import MainHeader from "@/components/Global/MainHeader";
import { useState } from "react";
import FooterLabel from "@/components/Global/FooterLabel";
import BackgroundComponent from "@/components/ui/BackgroundComponent";
import { usePathname } from "next/navigation";
import { LoginModalProvider } from "@/context/LoginModalContext";
import LoginModal from "@/components/Global/LoginModal";
import { useLoginModal } from "@/context/LoginModalContext";
// import CustomCursor from "@/components/Body/CustomCursor";
// import ThemeProviderClient from "@/providers/ThemeProviderClient";

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

// Wrapper component to use hooks
const LoginModalWrapper = () => {
  const { isOpen, message, callbackUrl, hideLoginModal } = useLoginModal();
  return (
    <LoginModal
      isOpen={isOpen}
      onClose={hideLoginModal}
      message={message}
      callbackUrl={callbackUrl}
    />
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchText, setSearchText] = useState("");
  const pathname = usePathname();

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
          {/* <ThemeProviderClient> */}
          <SessionProvider
            refetchInterval={0} // Disable automatic refetching
            refetchOnWindowFocus={false}
          >
            <CreditsProvider>
              <LoginModalProvider>
                <div className="relative isolate overflow-hidden">
                  {pathname !== "/" && (
                    <div className="absolute inset-0 -z-10">
                      <BackgroundComponent />
                    </div>
                  )}
                  <Header
                    searchText={searchText}
                    setSearchText={setSearchText}
                  />
                  <main>{children}</main>
                  {/* <CustomCursor /> */}
                  <FooterLabel />
                  <Footer />
                  <LoginModalWrapper />
                </div>
              </LoginModalProvider>
            </CreditsProvider>
          </SessionProvider>
          {/* </ThemeProviderClient> */}
        </Providers>
      </body>
    </html>
  );
}
