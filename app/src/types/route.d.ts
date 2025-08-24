import type React from 'react';
import type { Layout } from './layout';
import type { Role } from './role';

export type Route = {
  title: string;
  path: string;
  icon: React.ReactNode;
  element: React.ReactNode;
  index?: boolean;
  children?: Route[];
  layout?: Layout;
  sidebar?: boolean;
  roles?: Role[];
};
