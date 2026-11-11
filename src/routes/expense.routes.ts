import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller.js';
import { validateExpense } from '../middleware/validate-expense.js';

const router = Router();

router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.post('/', validateExpense, createExpense);
router.put('/:id', validateExpense, updateExpense);
router.delete('/:id', deleteExpense);

export default router;
