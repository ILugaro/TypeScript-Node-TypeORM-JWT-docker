import { Request, Response } from "express";
import { validate } from "class-validator";
import { Visit } from "../visit/visit.models"
import {dataSource} from "../../app"
//import jwtDecode from "jwt-decode";

export interface ErrnoException extends Error {
  code: string;
}

class Controller {

  //регистрация посещения 
  static newVisit = async (req: Request, res: Response): Promise<Response> => {
    const {box, carId} = req.body;
 
  /*   const token: any = jwtDecode(req.headers.authorization as string);

    if (owner_id && token.userId != owner_id && token.role != 'a'){
        return res.status(400).send('Для изменения данных другого пользователя необходимы права администратора!');
    } */

    const visit = new Visit();
    visit.box = box
    visit.car = carId
    //visit.owner_id = owner_id || token.userId

    const errors = await validate(visit);
    if (errors.length > 0) {
        return res.status(400).send(errors);
    }
    try {
    let update:any = await dataSource
      .createQueryBuilder()
      .update(Visit)
      .set(visit)
      .where(`updatedAt < (localtimestamp - INTERVAL '${process.env.LIFETIME_VISIT}')`)
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
            return res.status(400).send("Данный бокс уже занят.");
          }
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