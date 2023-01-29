import { Request, Response } from "express";
import { validate } from "class-validator";
import { Car } from "../car/car.models"
import {dataSource} from "../../app"
import jwtDecode from "jwt-decode";

class Controller {

  //Добавления автомобиля 
  static newCar = async (req: Request, res: Response): Promise<Response> => {
    const { number, brand, name, owner_id} = req.body;
 
    const token: any = jwtDecode(req.headers.authorization as string);

    if (owner_id && token.userId != owner_id && token.role != 'a'){
        return res.status(400).send('Для изменения данных другого пользователя необходимы права администратора!');
    }
 
    const car = new Car();
    car.number = number;
    car.brand = brand;
    car.name = name;
    car.owner_id = owner_id || token.userId

    const errors = await validate(car);
    if (errors.length > 0) {
        return res.status(400).send(errors);
    }
    try {
        await dataSource.manager.save(car)
    } catch (e) {
        console.log(e);
        return res.status(409).send(e);
    }
    return res.status(201).send("Автомобиль добавлен");
    };

    static showCars = async (req: Request, res: Response): Promise<any> => {
        let cars;
        try {
            cars = await dataSource.getRepository(Car)
                .createQueryBuilder("car") 
                .where(`owner_id = '${req.params.id}'`)
                .getMany()
        }
        catch(e){
            console.log(e);
            return res.status(400).send(e);
        }
        return res.status(200).send(cars);
    }
}

export default Controller;