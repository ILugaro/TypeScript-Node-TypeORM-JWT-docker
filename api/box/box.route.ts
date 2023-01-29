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
        //получение списка боксов
        this.router.get('/', /*this.authController.authenticateJWT,*/ Controller.showBoxs)
    }
}
