import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PathSeeker",
  description: "Voice and text route planning with AI extraction, transcription, and Google route optimization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${lora.variable}`}>
      <body className="antialiased" style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}>
        <style>{`
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-lora), Georgia, serif;
          }
        `}</style>
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
          <TooltipProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
