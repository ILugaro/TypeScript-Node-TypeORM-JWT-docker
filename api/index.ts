import { Router } from 'express';
import CarRoutes from './car/car.route'
import UserRoutes from './user/user.route'

const routes = Router();

routes.use("/car", new CarRoutes().router);
routes.use("/user", new UserRoutes().router);

export default routes;