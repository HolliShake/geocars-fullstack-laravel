import React, { useMemo } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from '../ui/breadcrumb';

type BreadcrumbProps = {
  path: string;
  label: string;
  current?: boolean;
};

type PageLayoutProps = {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbProps[];
  children: React.ReactNode;
};

export default function PageLayout({
  children,
  title = 'Page Title',
  description = 'Page Description',
  breadcrumbs = [],
}: PageLayoutProps): React.ReactNode {
  const computedBreadcrumbs: React.ReactNode[] = useMemo(() => {
    let breadcrumbsToUse: BreadcrumbProps[] = breadcrumbs;
    if (breadcrumbs?.length === 0) {
      breadcrumbsToUse = window.location.pathname.split('/').reduce((acc, segment, index, arr) => {
        if (segment) {
          acc.push({
            path: '#',
            label: segment.charAt(0).toUpperCase() + segment.slice(1),
            current: index === arr.length - 1,
          });
        }
        return acc;
      }, [] as BreadcrumbProps[]);
    }
    return breadcrumbsToUse.map((breadcrumb, index) => (
      <BreadcrumbItem key={index}>
        <a
          href={breadcrumb.path}
          className="text-muted-foreground hover:text-cyan-400 transition-all duration-300 font-medium"
        >
          {breadcrumb.label}
        </a>
      </BreadcrumbItem>
    ));
  }, [breadcrumbs]);

  return (
    <section className="space-y-8">
      {/* Enhanced Header Section without card styling */}
      <div className="flex items-center justify-between py-6">
        {/* Left side - Title and Description */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg font-medium">{description}</p>
        </div>

        {/* Right side - Enhanced Breadcrumb */}
        <div className="relative">
          <Breadcrumb>
            <BreadcrumbList className="flex items-center space-x-2 bg-accent/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
              {computedBreadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  {breadcrumb}
                  {index < computedBreadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="text-muted-foreground/50" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Content Area with enhanced spacing */}
      <div className="space-y-6">{children}</div>
    </section>
  );
}
