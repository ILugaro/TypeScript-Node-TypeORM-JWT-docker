import { Request, Response } from "express";
import { Box } from "../box/box.models"
import {dataSource} from "../../app"
import 'dotenv/config';
import jwtDecode from "jwt-decode";
import {JwtPayload} from "../user/user.controller"


class Controller {

  //Отправить список боксов 
  static showBoxs = async (req: Request, res: Response): Promise<Response> => {
    let boxs;
    let token: JwtPayload;

    try{
      token = jwtDecode(req.headers.authorization as string);
    }
    catch (e){
      return res.status(403).send(e);
    }
    try {
      if ("role" in token && token.role == 'a' && req.body.info == 'full'){ //список боксов плю конфиденциальная информация о машинах и клиентах с текущими посещениями
        boxs = await dataSource.getRepository(Box)
        .createQueryBuilder("box")
        .leftJoinAndSelect("box.visit", "visit", `"visit"."updatedAt" > (localtimestamp - INTERVAL '${process.env.LIFETIME_VISIT}') AND "visit"."iscanseled" = false`)
        .leftJoinAndSelect("visit.car", "car")
        .leftJoinAndSelect("car.user", "user")
        .select('box')
        .addSelect("visit")
        .addSelect("car")
        .addSelect("user.id")
        .addSelect("user.login")
        .addSelect("user.phone")
        .getMany()
      }
      else { // список боксов. если бокс занят то передается только информация о начале посещения (без данных клиентов)
        boxs = await dataSource.getRepository(Box)
        .createQueryBuilder("box")
        .leftJoinAndSelect("box.visit", "visit", `"visit"."updatedAt" > (localtimestamp - INTERVAL '${process.env.LIFETIME_VISIT}') AND "visit"."iscanseled" = false`)
        .leftJoinAndSelect("visit.car", "car")
        .select('box')
        .addSelect("visit.updatedAt")
        .getMany()
      }
    }
    catch(e){
      console.log(e);
      return res.status(400).send(e);
    }
    return res.status(200).send(boxs);
  }
}

export default Controller;

