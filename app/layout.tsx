import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { Header } from "@/components/header";
import { AnimatedBackground } from "@/components/animated-background";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Anton Filippov · Portfolio",
  description:
    "Senior front-end engineer crafting immersive, accessible web experiences.",
  openGraph: {
    title: "Anton Filippov · Portfolio",
    description:
      "Senior front-end engineer crafting immersive, accessible web experiences.",
    url: "https://antonfilippov.dev",
    siteName: "Anton Filippov",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Anton Filippov · Portfolio",
    description:
      "Senior front-end engineer crafting immersive, accessible web experiences."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider>
          <LocaleProvider>
            <AnimatedBackground />
            <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-4 pb-16 pt-8 md:px-8">
              <Header />
              <main className="flex-1 space-y-16">{children}</main>
              <footer className="pb-6 pt-4 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Anton Filippov. Crafted with Next.js.
              </footer>
            </div>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
