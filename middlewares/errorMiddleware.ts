import { Request, Response, NextFunction} from "express";
import httpStatus from 'http-status';

// обработка not found
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND);
  res.json({
    success: false,
    message: 'Requested Resource Not Found'
  });
  res.end();
};

//обработка внутренних ошибок сервера
export const internalServerError = (err: { status: any; message: any; extra: any; }, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR);
  res.json({
    message: err.message,
    extra: err.extra,
    errors: err
  });
  res.end();
};
