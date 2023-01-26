import { Request, Response } from "express";
import { validate } from "class-validator"; //зачем?
import { Car } from "../car/car.models"
import {dataSource} from "../../app"

class Controller {

  //Добавления автомобиля 
  static newCar = async (req: Request, res: Response): Promise<Response> => {
    const { number, brand, name, owner_id } = req.body;
    
    const car = new Car();

    car.number = number;
    car.brand = brand;
    car.name = name;
    car.owner_id = owner_id;

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
}

export default Controller;