import type { Request, Response, NextFunction } from 'express';

// Error handler dipasang paling akhir. Express 5 otomatis meneruskan error
// dari controller async (misalnya database gagal diakses) ke middleware ini.
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // Body request bukan JSON yang valid, dilempar oleh express.json()
  if (typeof err === 'object' && err !== null && 'type' in err && err.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Body harus berupa JSON yang valid' });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server' });
}
