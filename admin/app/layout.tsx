import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEET Prep Admin",
  description: "Admin panel for NEET Prep app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
