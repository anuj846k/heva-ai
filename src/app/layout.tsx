import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Script from 'next/script';

const sfPro = localFont({
  src: '../../public/fonts/SF-Pro-Display-Regular.otf',
  variable: '--font-sf-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Heva AI - Agent Trace Viewer',
  description: 'AI Agent Interface with Live Tool Visualization',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={`${sfPro.variable} h-full antialiased`}>
      {/* <head>
        {process.env.NODE_ENV === 'development' && (
          <Script
            src='//unpkg.com/react-grab/dist/index.global.js'
            crossOrigin='anonymous'
            strategy='beforeInteractive'
          />
        )}
      </head> */}
      <body className='h-full'>{children}</body>
    </html>
  );
}
