import { Router } from 'express';
import Controller from './car.controller'; 
import Auth from '../../middlewares/AuthController'

export default class CarRoutes {
    public router: Router;
    public authController: Auth = new Auth();

    constructor() {
        this.router = Router();
        this.routes();
      }
    routes() {
        //добавление нового автомобиля
        this.router.post('/', this.authController.authenticateJWT, Controller.newCar)
        //получить списка автомобилей пользователя
        this.router.get('/:id', this.authController.authenticateJWT, Controller.showCars)
        //удаление автомобиля
        this.router.delete('/:number', this.authController.authenticateJWT, Controller.deleteCar)
    }
}
