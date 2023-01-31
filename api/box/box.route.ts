import { Router } from 'express';
import Controller from './box.controller'; 
import Auth from '../../middlewares/AuthController'

export default class BoxRoutes {
    public router: Router;
    public authController: Auth = new Auth();

    constructor() {
        this.router = Router();
        this.routes();
      }
    routes() {
        //создать новый бокс
        this.router.post('/', this.authController.authenticateJWT, Controller.newBox)
        //получение списка боксов
        this.router.get('/', this.authController.authenticateJWT, Controller.showBoxs)
    }
}
