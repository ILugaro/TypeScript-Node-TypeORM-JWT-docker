import { Router } from 'express';
import CarRoutes from './car/car.route'
import UserRoutes from './user/user.route'
import BoxRoutes from './box/box.route'
import VisitRoutes from './visit/visit.route';

const routes = Router();

routes.use("/car", new CarRoutes().router);
routes.use("/user", new UserRoutes().router);
routes.use("/box", new BoxRoutes().router);
routes.use("/visit", new VisitRoutes().router);

export default routes;