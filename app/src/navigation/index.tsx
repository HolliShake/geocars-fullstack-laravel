/* eslint-disable react-refresh/only-export-components */
import type { Route } from '@/types/route';
import AdminRoutes from './admin';
import PUBLIC from './public';
import UseryRoute from './user';

const checkIfDuplicateTitle = (routes: readonly Route[]): readonly Route[] => {
  const keys = routes.map((route) => route.key);
  const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
  if (duplicateKeys.length > 0) {
    throw new Error(`Duplicate key found: ${duplicateKeys.join(', ')}`);
  }
  return routes;
};

export default checkIfDuplicateTitle([...PUBLIC, ...AdminRoutes, ...UseryRoute]);
