import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'RankUp ValoPoints',
  description: 'Track Valorant ranked progress with dojo-style points',
  icons: { icon: '/rankvaloicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-valo-black text-gray-100 min-h-screen"
        style={{ backgroundColor: '#0f1923', color: '#f3f4f6', minHeight: '100vh' }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
