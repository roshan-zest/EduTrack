import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
