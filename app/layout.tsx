import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HubCheck",
  description: "Innovation Hub Cleaning Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-slate-50 antialiased`}>
        <Nav />
        <main className="md:ml-56 min-h-screen pb-24 md:pb-0">{children}</main>
      </body>
    </html>
  );
}
