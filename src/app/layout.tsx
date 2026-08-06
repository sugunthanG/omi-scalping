import type {
  Metadata,
} from "next";

import {
  AppProviders,
} from "@/components/providers/app-providers";

import {
  RootShellRouter,
} from "@/components/layout/root-shell-router";

import "./globals.css";


export const metadata: Metadata = {
  title: {
    default:
      "OMI Trading AI",

    template:
      "%s | OMI Trading AI",
  },

  description:
    "Institutional XAUUSD intelligence, monitoring and management platform.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <AppProviders>
          <RootShellRouter>
            {children}
          </RootShellRouter>
        </AppProviders>
      </body>
    </html>
  );
}