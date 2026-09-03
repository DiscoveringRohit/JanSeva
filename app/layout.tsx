import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context/app-context";
import { BudgetProvider } from "@/lib/context/budget-context";
import { PollProvider } from "@/lib/context/poll-context";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleTranslator } from "@/components/layout/google-translator";

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
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#134431" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
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
            <BudgetProvider>
              <PollProvider>
                <GoogleTranslator />
                <LayoutWrapper>{children}</LayoutWrapper>
              </PollProvider>
            </BudgetProvider>
          </AppProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
