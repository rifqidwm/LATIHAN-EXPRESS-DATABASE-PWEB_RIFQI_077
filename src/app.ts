import express from 'express';
import expenseRouter from './routes/expense.routes.js';
import { requestLogger } from './middleware/request-logger.js';
import { notFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(requestLogger);            // catat setiap request yang masuk
app.use(express.json());           // agar req.body bisa dibaca dari JSON
app.use(express.static('public')); // sajikan front-end (index.html, style.css, app.js)

app.use('/api/expenses', expenseRouter);

app.use(notFound);                 // 404 untuk route yang tidak terdaftar
app.use(errorHandler);             // 500 jika terjadi error, misalnya database gagal diakses

export default app;
