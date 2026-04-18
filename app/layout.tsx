import type { Metadata } from "next";
import { TopNav } from "@/components/top-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "FAIS | Faculty Activity & Insights System",
  description: "Track teaching activity, analyze faculty performance, and generate data-driven academic insights."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        <div className="pb-6">{children}</div>
      </body>
    </html>
  );
}
