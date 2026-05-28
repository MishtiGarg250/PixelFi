import express from 'express';
import { createTransaction, getUserTransactions } from '../controllers/transaction.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createTransaction);
router.get('/', protect, getUserTransactions);

export default router;