import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";

const GlobalPlayer = dynamic(() => import("../components/GlobalPlayer"), { ssr: false });

export const metadata: Metadata = {
  title: "SPACE.GEMS // AUDIO TRANSMISSION & ARCHIVE",
  description: "A secure, minimalist audio sharing platform for A&R managers and music producers. Off-White industrial design language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#fcfcfc] text-black min-h-screen flex flex-col blueprint-grid pb-28 relative">
        <main className="flex-1 w-full max-w-7xl mx-auto border-x border-zinc-300 min-h-screen flex flex-col">
          {children}
        </main>
        <GlobalPlayer />
      </body>
    </html>
  );
}
