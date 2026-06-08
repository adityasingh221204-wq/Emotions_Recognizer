import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '../context/theme-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChronosFeed | Alternate Reality Simulation Console',
  description: 'Explore timelines, news, and social feeds of history diverted. What if the internet was invented in 1890?',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-text-main">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
