import { Router } from 'express';
import Controller from './user.controller'; 
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
        //список пользователей (только для администратора)
        this.router.get("/", Controller.showUsers)
        //авторизация
        this.router.post("/login", Controller.login);
        //создание первого администратора
        this.router.post("/createFirstAdmin", Controller.createFirstAdmin)
    }
}