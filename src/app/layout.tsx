import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "keysmash — daily typing challenge",
  description: "One passage a day. How fast can you type?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} h-full`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Nav />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
