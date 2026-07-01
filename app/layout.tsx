import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "HubCheck",
  description: "Innovation Hub Cleaning Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className={`${font.className} antialiased`} style={{ background: "#f5f5ff" }}>
        <Nav />
        <main className="md:ml-56 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
