/*Посещения удаляются только при удалении соответствующих боксов.
При прерывании посещения параметр "iscanseled" устанавливается в true
Если же посещение закончено по времени, оно будет фильтроваться по "updatedAt"
Это позволяет не следить за актуальностью данных в таблице visit.

При создании нового посещение бокса - будет обновляться старое (если этот бокс ранее уже имел посещение). 
Таким образом количество строк в таблице visit не будет превышать количество боксов. */
import { Request, Response } from "express";
import { validate } from "class-validator";
import { Visit } from "../visit/visit.models"
import {dataSource} from "../../app"
import { Car } from "../car/car.models";
import jwtDecode from "jwt-decode";
import {JwtPayload} from "../user/user.controller"
import { Box } from "../box/box.models";



export interface ErrnoException extends Error {
  code: string;
}

class Controller {

  //регистрация посещения 
  static newVisit = async (req: Request, res: Response): Promise<Response> => {
    
    let token: JwtPayload;
    try{
      token = jwtDecode(req.headers.authorization as string);
    }
    catch (e){
      return res.status(403).send(e);
    }

    let {box, carId, owner_id} = req.body;
    
     if (owner_id && token.id != owner_id && token.role != 'a'){
        return res.status(400).send('Для изменения данных другого пользователя необходимы права администратора!');
    }  

    owner_id = owner_id||token.id;
    
    const userRepository = dataSource.getRepository(Car);
    try {
      await userRepository.findOneOrFail({ where: {'owner_id': owner_id, 'id': carId}});
  } catch (error) {
    return res.status(401).send(`Клиент с id ${owner_id} не имеет автомобиля с id ${carId}`);
  }

    const visit = new Visit();
    visit.box = box
    visit.car = carId
    visit.iscanseled = false
    visit.user = owner_id

    const errors = await validate(visit);
    if (errors.length > 0) {
        return res.status(400).send(errors);
    }
    try {
    //тут планировалось использовать .orUpdate с параметром indexPredicate, но генерируемый SQL не соответствовал ожиданию и пришлось делать .insert и .update через try/catch  
    let update:any = await dataSource
      .createQueryBuilder()
      .update(Visit)
      .set(visit)
      .where(`updatedAt < (localtimestamp - INTERVAL '${process.env.LIFETIME_VISIT}') OR "visit"."iscanseled" = true`)
      .execute()

      if (update.affected == 0){ //обновления не было так как на этот бокс еще никогда не было посещений (или клиент пытается занять уже занятый бокс)

        try{
          await dataSource
          .createQueryBuilder()
          .insert()
          .into(Visit)
          .values(visit)
          .execute()
        }
        catch (e:any){
          if ('code' in e && e.code == '23505'){
            return res.status(400).send("Данный бокс уже занят или данный автомобиль уже имеет активное посещение");
          }
          return res.status(400).send(e);
        }
      }
    } 
    catch (e) {
        console.log(e);
        return res.status(409).send(e);
    }

    return res.status(201).send("Посещение создано");
    };

    //прекращение посещения (досрочное)
    static stopVisit =  async (req: Request, res: Response): Promise<Response> => {

      let token: JwtPayload;
      try{
        token = jwtDecode(req.headers.authorization as string);
      }
      catch (e){
        return res.status(403).send(e);
      }
  
      let {owner_id} = req.body;
      owner_id = owner_id||token.id;
      const userRepository = dataSource.getRepository(Visit);
      let box = new Box; 
      box.name = req.params.id
      if (token.role != 'a'){
        try {
          await userRepository.findOneOrFail({ where: {user: token.id, box: box}});
        } catch (error) {
          return res.status(401).send(`Клиент с id ${token.id} не занимает бокс ${req.params.id}`);
        }
      }  
      await dataSource
        .createQueryBuilder()
        .update(Visit)
        .set({'iscanseled':true})
        .where(`box = '${req.params.id}'`)
        .execute()
      return res.status(204).send(); //статус 204 не имеет сообщения
    }
}

export default Controller;