import { Request, Response } from "express";
import { validate } from "class-validator";
import { User } from "../user/user.models"
import {dataSource} from "../../app"
import * as jwt from "jsonwebtoken";
import 'dotenv/config';
import jwtDecode from "jwt-decode";

const JWT_SECRET_KEY:string = process.env.JWT_SECRET_KEY as string;
const JWT_EXPIRATION:string = process.env.JWT_EXPIRATION as string;

 export interface JwtPayload {
  id: number
  role: string
}

class Controller {

    // Аунтификация
    static login = async (req: Request, res: Response): Promise<Response> => {
        //дешифровка Basic авторизации
        let method:('phone'|'login') = req.body.method;

        const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
        const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
        
         if (!(login && password)) {
          return res.status(400).send('Для авторизации необходим логин/телефон и пароль!');
        } 
    
        const userRepository = dataSource.getRepository(User);
        let user: User;

        //определяется тип аунтификации - по номеру или по логину.
        let obj_login:{phone?:string, login?:string} = {};
        method || (method='login');  //по логину по умолчанию

        switch (method){
          case 'phone':
            obj_login.phone = login;
            break
          case 'login':
            obj_login.login = login;
        }

        try {
            user = await userRepository.findOneOrFail({ where: obj_login});
        } catch (error) {
          return res.status(401).send('Данный пользователь отсутствует.');
        }
    
        // проверка пароля
        if (!user.checkIfUnencryptedPasswordIsValid(password)) {
            return res.status(401).send('Неверный пароль.');
        }
    
        // JWT действующий 1 час
        const token = await Controller.signJWT(user);
        return res.send({ token });
      };

    static signJWT = async (user: JwtPayload): Promise<string> => {
        const token = jwt.sign(
          {
            id: user.id,
            role: user.role,
          },
          JWT_SECRET_KEY,
          {
            expiresIn: JWT_EXPIRATION,
          },
        );
        return token;
      };

  //Создание нового пользователя
  static newUser = async (req: Request, res: Response): Promise<Response> => {
        const { password, phone, login, role='c' } = req.body;
        const user = new User();

        user.password = password;
        user.role = role;
        user.phone = phone;
        user.login = login;

        const errors = await validate(user);
        if (errors.length > 0) {
            return res.status(400).send(errors);
        }

        user.hashPassword();

        try {
            await dataSource.manager.save(user)
        } catch (e) {
            return res.status(409).send(e);
        }
    return res.status(201).send('Пользователь создан!');
    };

  static createFirstAdmin = async (req: Request, res: Response): Promise<Response> => {
        const countUser = await dataSource.getRepository(User).count({where:{'role':'a'}})
        if (countUser == 0 ){
          const { password, phone, login } = req.body
          const user = new User();
          user.password = password;
          user.login = login;
          user.phone = phone;
          user.role = 'a';

          
          const errors = await validate(user);
          if (errors.length > 0) {
              return res.status(400).send(errors);
          }
  
          user.hashPassword();
  
          try {
              await dataSource.manager.save(user)
          } catch (e) {
              return res.status(409).send(e);
          }
          return res.status(201).send('Пользователь создан!');
        }
        else{
          return res.status(403).send('Данная функция приминяется только при регистрации первого администратора!');
        }
  }
  static showUsers = async (req: Request, res: Response): Promise<Response> => {
    let token: JwtPayload;
    let users;
    try{
      token = jwtDecode(req.headers.authorization as string);
    }
    catch (e){
      return res.status(403).send(e);
    }

     if (token.role != 'a'){
        return res.status(400).send('Для просмотра данных другого пользователя необходимы права администратора!');
    }  

    try {
      users = await dataSource.getRepository(User)
          .createQueryBuilder("user")
          .select('user.login') 
          .addSelect('user.phone') 
          .addSelect('user.role') 
          .addSelect('user.id') 
          .getMany()
  }
  catch(e){
      console.log(e);
      return res.status(400).send(e);
  }
  return res.status(200).send(users);
  }
  
}

export default Controller;