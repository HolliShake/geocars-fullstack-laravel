import Providers from '@/components/providers';
import type React from 'react';
import TopBar from './components/topbar';

type TopbarLayoutProps = {
  children: React.ReactNode;
};

export default function TopbarLayout({ children }: TopbarLayoutProps): React.ReactNode {
  return (
    <Providers>
      <section className="min-h-screen w-full overflow-y-auto overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative min-h-screen w-full">
          {/* Header */}
          <TopBar />
          {/* Subtle gradient overlay for depth */}
          <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />

          {/* Main content container */}
          <div className="relative z-10 w-full">{children}</div>
        </div>
      </section>
    </Providers>
  );
}
