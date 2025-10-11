import Providers from '@/components/providers';
import type React from 'react';
import TopBar from './components/topbar';

type TopbarLayoutProps = {
  children: React.ReactNode;
};

export default function TopbarLayout({ children }: TopbarLayoutProps): React.ReactNode {
  return (
    <Providers>
      <section className="h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative h-full w-full flex flex-col">
          {/* Header */}
          <TopBar />
          {/* Subtle gradient overlay for depth */}
          <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />

          {/* Main content container */}
          <div className="relative z-10 w-full flex-1 overflow-y-auto">{children}</div>
        </div>
      </section>
    </Providers>
  );
}
