import Providers from '@/components/providers';
import type React from 'react';

type DefaultLayoutProps = {
  children: React.ReactNode;
};

export default function DefaultLayout({ children }: DefaultLayoutProps): React.ReactNode {
  return (
    <Providers>
      <section className="min-h-screen min-w-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative">
          {/* Subtle gradient overlay for depth */}
          <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />

          {/* Main content container */}
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="min-h-screen">{children}</div>
          </div>
        </div>
      </section>
    </Providers>
  );
}
