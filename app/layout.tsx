import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import AntdProvider from '@/components/AntdProvider';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const folioExtraBold = localFont({
  src: '../public/fonts/Folio Extra Bold.otf',
  variable: '--font-folio',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'cinebracket',
  description: 'Bracket-style movie picker for your Letterboxd watchlist',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${geistSans.variable} ${folioExtraBold.variable} h-full`}>
      <body className='min-h-full flex flex-col bg-[#FDFBD4]'>
        <AuthProvider><AntdProvider>{children}</AntdProvider></AuthProvider>
      </body>
    </html>
  );
}
