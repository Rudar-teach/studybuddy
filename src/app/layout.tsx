import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "StudyBuddy - Find Your Perfect Study Partner",
  description: "Match with study partners and project collaborators based on subjects, skills, and availability.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0f172a] text-[#f8fafc] min-h-screen bg-glow`}>
        {children}
      </body>
    </html>
  );
}
