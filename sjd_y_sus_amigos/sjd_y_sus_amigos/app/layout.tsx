import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../hooks/AppContext';

export const metadata: Metadata = {
  title: 'Paws&Pause - The Curated Sanctuary',
  description: 'Premium dog walking services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
