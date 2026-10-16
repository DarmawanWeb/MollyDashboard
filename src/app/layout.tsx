import type { Metadata } from "next";
import "./globals.css";
import { JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Molly Dashboard",
  description: "Robot Guide Dashboard — Lite3 Venture · ROS 2 Humble",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("font-mono dark", jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
