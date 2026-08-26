import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context/app-context";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleTranslator } from "@/components/layout/google-translator";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JanSeva | AI-Powered Civic Social Platform",
  description:
    "Report civic issues, track real-time resolution SLAs, empower your ward, and connect with municipal officers through AI Computer Vision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f7f9fb] text-[#191c1e] antialiased">
        <GoogleOAuthProvider
          clientId={
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
            "973723561970-o3gh3qu53a4c52tmdim4h3gq7r79vakc.apps.googleusercontent.com"
          }
        >
          <AppProvider>
            <GoogleTranslator />
            <LayoutWrapper>{children}</LayoutWrapper>
          </AppProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
