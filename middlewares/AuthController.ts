import { NextFunction, Request, Response } from "express";
import passport from 'passport';
import "../middlewares/passport";


export default class AuthController {
  public authenticateJWT(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate("jwt", (err, user) => {      
      if (err) {
        return res.status(401).send(err);
      }
      if (!user) {
        return res.status(401).send('Ошибка аунтификации!');
      } else {
        return next();
      }
    })(req, res, next);
  }

  public authorizeJWT(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate("jwt", (err, user, jwtToken) => {
      if (err) {
        return res.status(401).send('Ошибка авторизации!');
      }
      if (!user) {
        return res.status(401).send('Ошибка авторизации!');
      } else {
        const scope = req.baseUrl.split("/").slice(-1)[0];
        const authScope = jwtToken.scope;
        if (authScope && authScope.indexOf(scope) > -1) {
          return next();
        } else {
          return res.status(401).send('Ошибка авторизации!');
        }
      }
    })(req, res, next);
  }
}