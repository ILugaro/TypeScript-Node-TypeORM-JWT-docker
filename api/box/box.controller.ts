import { Request, Response } from "express";
import { Box } from "../box/box.models"
import {dataSource} from "../../app"
import 'dotenv/config';


class Controller {

  //Отправить список боксов 
  static showBoxs = async (req: Request, res: Response): Promise<Response> => {
    let boxs;
    try {
      boxs = await dataSource.getRepository(Box)
        .createQueryBuilder("box")
        .leftJoinAndSelect("box.visit", "visit", `"visit"."updatedAt" > (localtimestamp - INTERVAL '${process.env.LIFETIME_VISIT}') AND "visit"."iscanseled" = false`)
        .leftJoinAndSelect("visit.car", "car")
        .select('box')
        .addSelect("visit.updatedAt")
        .getMany()
    }
    catch(e){
      console.log(e);
      return res.status(400).send(e);
    }
    return res.status(200).send(boxs);
  }
}

export default Controller;

