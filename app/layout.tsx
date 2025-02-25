import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChatBot } from "@/components/chat-bot";
import { Toaster } from "sonner";
import { ReCaptchaProvider } from "@/components/providers/recaptcha-provider";
import { ReCaptchaScript } from "@/components/providers/recaptcha-script";

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true
});

export const metadata: Metadata = {
  title: 'Carlora Strategic Innovation Ltd',
  description: 'Empowering businesses through strategic innovation and expert consulting services.',
  keywords: ['business consulting', 'strategic innovation', 'digital transformation', 'business growth'],
  authors: [{ name: 'Carlora Strategic Innovation' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://carlora.com',
    title: 'Carlora Strategic Innovation Ltd',
    description: 'Empowering businesses through strategic innovation and expert consulting services.',
    siteName: 'Carlora Strategic Innovation',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReCaptchaProvider>
            <ReCaptchaScript />
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1">{children}</div>
              <SiteFooter />
              <ChatBot />
            </div>
            <Toaster />
          </ReCaptchaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}