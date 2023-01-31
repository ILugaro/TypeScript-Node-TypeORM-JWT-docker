import { Request, Response} from "express";
import { validate } from "class-validator";
import { Car } from "../car/car.models"
import {dataSource} from "../../app"
import jwtDecode from "jwt-decode";
import { JwtPayload } from "../user/user.controller";


class Controller {

    //Добавления автомобиля 
    static newCar = async (req: Request, res: Response): Promise<Response> => {
    const { number, brand, name, owner_id} = req.body;
 
    const token: any = jwtDecode(req.headers.authorization as string);

    if (owner_id && owner_id != token.id && token.role != 'a'){
        return res.status(400).send('Для изменения данных другого пользователя необходимы права администратора!');
    }
 
    const car = new Car();
    car.number = number;
    car.brand = brand;
    car.name = name;
    car.owner_id = owner_id || token.id

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
        
        let token: JwtPayload;
        try{
          token = jwtDecode(req.headers.authorization as string);
        }
        catch (e){
          return res.status(403).send(e);
        }
        
         if (req.params.id != String(token.id) && token.role != 'a'){
            return res.status(400).send('Для просмотра данных другого пользователя необходимы права администратора!');
        }  
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

    static deleteCar = async (req: Request, res: Response): Promise<any> => {
        let token: JwtPayload;
        const carRepository = dataSource.getRepository(Car);

        try{
          token = jwtDecode(req.headers.authorization as string);
        }
        catch (e){
          return res.status(403).send(e);
        }
        if (token.role != 'a'){
            try {
                await carRepository.findOneOrFail({ where: {number: req.params.number, owner_id: token.id}});
            } catch (error) {
                return res.status(401).send(`Клиент с id ${token.id} не является владельцем автомобиля с номером ${req.params.number}`);
            }
        }  
        try {
            const del = await dataSource
                .createQueryBuilder()
                .delete()
                .from(Car)
                .where("number = :number", { number: req.params.number})
                .execute()
                if (del.affected == 0){
                    return res.status(401).send(`Ошибка! Автомобиля с номером ${req.params.number} нет в базе данных!`);
                }
            }
        catch (e){
            console.log(e);
            return res.status(400).send(e);
        }
            
            return res.status(204).send();
        }
}
export default Controller;