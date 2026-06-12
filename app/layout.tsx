import type { Metadata } from 'next';
import { Providers } from './providers';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Schrift BBS',
  description: 'Plateforme de gestion des guildes et scores pour Bleach Brave Souls',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
