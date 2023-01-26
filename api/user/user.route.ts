import { Router } from 'express'; //old
import Controller from './user.controller'; //old
import Auth from '../../middlewares/AuthController'

export default class CarRoutes {
    public router: Router;
    public authController: Auth = new Auth();

    constructor() {
        this.router = Router();
        this.routes();
      }

    routes() {
        //добавление нового пользователя
        this.router.post('/', Controller.newUser);

        //авторизация
        this.router.post("/login", Controller.login);
    }
}