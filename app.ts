import express from 'express';
import * as errorHandler from "./middlewares/errorMiddleware";
import api from './api/index';
import 'dotenv/config';

import { DataSource } from 'typeorm';
import { User } from "./api/user/user.models";
import { Car } from "./api/car/car.models";
import { Box } from "./api/box/box.models";
import { Visit } from "./api/visit/visit.models";

console.log('env.DB_HOST',process.env.PGADMIN_DEFAULT_EMAIL);

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.setMiddlewares(); 
    this.setRoutes(); 
    this.catchErrors();
  }

  private setMiddlewares(): void {
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));  
  }

  private setRoutes(): void {
    this.express.use('/api', api);
  }

  private catchErrors(): void {
    this.express.use(errorHandler.notFound);
    this.express.use(errorHandler.internalServerError);
  }

  public start(port: number): void {
    this.express.listen(port, () => {
      console.log("Server start on port ", port);
    });
  }
}
    
export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Car, Box, Visit],
  synchronize: true
});

const app = new App();

dataSource.initialize().then(() => {
    app.start(Number(process.env.SERVER_PORT));
})
.catch((err) => {
    console.error("Error during Data Source initialization", err)
})






