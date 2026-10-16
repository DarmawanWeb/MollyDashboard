import type { Metadata } from "next";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Molly Dashboard",
  description:
    "Operator console for the Molly tour guide robot — Deep Robotics Lite3 · ROS 2 Humble",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-mono dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
