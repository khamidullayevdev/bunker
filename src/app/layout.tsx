import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Black_Ops_One, Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import EnsureUser from "@/components/EnsureUser";
import AuthGate from "@/components/AuthGate";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { uzLocalization } from "@/lib/clerkUz";
import { LoadingScreen } from "@/components/ui";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
});

const blackOps = Black_Ops_One({
  variable: "--font-black-ops",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

// Every page waits for the sign-in check before showing content, so instant
// navigation validation cannot see the pages. Opt the app out of it.
export const instant = false;

export const metadata: Metadata = {
  title: "Bunker*cha",
  description: "Doʻstlar bilan omon qolish oʻyini: kim bunkerga kirishga loyiq?",
  applicationName: "Bunker*cha",
  appleWebApp: {
    capable: true,
    title: "Bunker*cha",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#28301C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={`${nunito.variable} ${blackOps.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ClerkProvider
          localization={uzLocalization}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        >
          <ConvexClientProvider>
            <EnsureUser />
            <div className="phone-shell">
              <div className="phone-frame">
                <div className="phone-scroll">
                  <div className="phone-content">
                    <Suspense fallback={<LoadingScreen />}>
                      <AuthGate>{children}</AuthGate>
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </ConvexClientProvider>
        </ClerkProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
