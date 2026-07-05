import type { Metadata, Viewport } from 'next';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wedding Wishes Wall',
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
    <html lang="zh-Hant">
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
