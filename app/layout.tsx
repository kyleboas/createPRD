import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import { SessionStatus } from '@/components/SessionStatus';

export const metadata: Metadata = {
  title: 'Create PRD',
  description: 'Generate and commit PRD and task markdown files.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <h1>Create PRD</h1>
          <SessionStatus />
        </header>
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
