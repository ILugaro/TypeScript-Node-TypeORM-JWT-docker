import { Router } from 'express';
import Controller from './visit.controller'; 
import Auth from '../../middlewares/AuthController'

export default class VisitRoutes {
    public router: Router;
    public authController: Auth = new Auth();

    constructor() {
        this.router = Router();
        this.routes();
      }
    routes() {
        //регистрация посещения бокса
        this.router.post('/', this.authController.authenticateJWT, Controller.newVisit)
        //прекращение посещения (досрочное)
        this.router.delete('/:id', this.authController.authenticateJWT, Controller.stopVisit)
    }
}