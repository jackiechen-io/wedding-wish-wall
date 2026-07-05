import type { Metadata, Viewport } from 'next';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Ma_Shan_Zheng } from 'next/font/google';
import './globals.css';

const handwritingFont = Ma_Shan_Zheng({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-handwriting',
});

export const metadata: Metadata = {
  title: '威丞&蕙如的婚禮祝福牆',
  description: 'A minimalist wedding wishes photo wall.'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FFFFFF'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" className={`${handwritingFont.variable}`}>
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
