/* eslint-disable react-refresh/only-export-components */
import type { Route } from '@/types/route';
import AdminRoutes from './admin';
import PUBLIC from './public';
import UseryRoute from './user';

const checkIfDuplicateTitle = (routes: readonly Route[]): readonly Route[] => {
  const titles = routes.map((route) => route.title);
  const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);
  if (duplicateTitles.length > 0) {
    throw new Error(`Duplicate title found: ${duplicateTitles.join(', ')}`);
  }
  return routes;
};

export default checkIfDuplicateTitle([...PUBLIC, ...AdminRoutes, ...UseryRoute]);
