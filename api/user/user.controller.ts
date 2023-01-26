import { Request, Response } from "express";
import { validate } from "class-validator";
import { User } from "../user/user.models"
import {dataSource} from "../../app"
import * as jwt from "jsonwebtoken";
import 'dotenv/config';

const JWT_SECRET_KEY:string = process.env.JWT_SECRET_KEY as string;
const JWT_EXPIRATION:string = process.env.JWT_EXPIRATION as string;

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

    static signJWT = async (user: { id: any; login: any; phone: any; role: any; firstName: any; lastName: any }): Promise<string> => {
        const token = jwt.sign(
          {
            userId: user.id,
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
        const { password, firstName, lastName, phone, login } = req.body;
        const user = new User();

        user.password = password;
        user.role = 'c';
        user.firstName = firstName;
        user.lastName = lastName;
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
}

export default Controller;