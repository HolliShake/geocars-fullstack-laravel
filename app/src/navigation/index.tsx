import AdminRoutes from './admin';
import PUBLIC from './public';
import UseryRoute from './user';

export default [...PUBLIC, ...AdminRoutes, ...UseryRoute];
