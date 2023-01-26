/* eslint-disable no-console */
import { ExtractJwt, Strategy, JwtFromRequestFunction } from "passport-jwt";
import passport from 'passport';
import 'dotenv/config';

const JWT_SECRET_KEY:string = process.env.JWT_SECRET_KEY as string; 

interface Opts {
  jwtFromRequest: JwtFromRequestFunction;
  secretOrKey: string;
}

const options: Opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET_KEY,
};

passport.use(
  "jwt",
  new Strategy(options, (token, done) => {
    const user: any = token;
    if (user) {
      return done(null, user, token);
    } else {
      return done(false, false);
    }
  }),
);