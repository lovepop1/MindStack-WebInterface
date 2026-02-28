import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MindStack — Your AI Context Engine',
  description:
    'MindStack captures your web, video, and IDE context and makes it queryable with multimodal AI.',
  keywords: ['AI', 'context', 'knowledge base', 'RAG', 'developer productivity'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          background: '#0F172A',
          minHeight: '100vh',
          color: '#E2E8F0',
        }}
      >
        {children}
      </body>
    </html>
  );
}
