export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_PORT: number;
      DB_USER: string;
      DB_HOST: string;
      DB_NAME: string;
      PASSWORD: string;
      
      JWT_SECRET_KEY: string;
      JWT_EXPIRATION: string;
      
      SERVER_PORT: number;

      LIFETIME_VISIT: string
    }
  }
}