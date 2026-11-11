import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const waktu = new Date().toLocaleTimeString('id-ID');
  console.log(`[${waktu}] ${req.method} ${req.originalUrl}`);
  next();
}
