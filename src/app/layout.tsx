import type { Metadata, Viewport } from "next";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { BRAND } from "@/constants/brand";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { UI_INIT_SCRIPT } from "@/lib/ui-prefs";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.robot} — ${BRAND.tagline.en}`,
    template: `%s · ${BRAND.robot}`,
  },
  description: `${BRAND.robot}, the AI tour guide robot by ${BRAND.maker.name} at the ${BRAND.partner.name} experience center.`,
  applicationName: `${BRAND.robot} Dashboard`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d10" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static, first-party theme and shell bootstrap; must run before paint
          dangerouslySetInnerHTML={{
            __html: THEME_INIT_SCRIPT + UI_INIT_SCRIPT,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
