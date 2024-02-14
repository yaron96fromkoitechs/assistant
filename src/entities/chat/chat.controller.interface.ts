import { NextFunction, Request, Response } from 'express';

export interface IChatController {
  getHistory: (req: Request, res: Response, next: NextFunction) => void;
}
