import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduSwarm – Personalized AI Learning",
  description:
    "A multi-agent AI platform that personalizes your learning experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/learn"
      signUpFallbackRedirectUrl="/learn"
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-background text-foreground antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
