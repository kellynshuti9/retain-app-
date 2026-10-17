import express from 'express';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// GET /api/budgets/:month  (month = YYYY-MM)
router.get('/:month', async (req, res) => {
  try {
    const { month } = req.params;

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Month must be YYYY-MM format' });
    }

    const budget = await Budget.findOne({ userId: req.user._id, month });

    // Calculate spending for that month
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: start, $lt: end },
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetAmount = budget?.amount || 0;
    const remaining = budgetAmount - totalSpent;
    const percentUsed = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

    let status = 'no_budget';
    if (budgetAmount > 0) {
      if (percentUsed >= 100) status = 'over';
      else if (percentUsed >= 80) status = 'approaching';
      else status = 'within';
    }

    res.json({
      month,
      budget: budgetAmount,
      totalSpent,
      remaining,
      percentUsed: Math.round(percentUsed * 100) / 100,
      status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/budgets/:month  (upsert)
router.put('/:month', async (req, res) => {
  try {
    const { month } = req.params;
    const { amount } = req.body;

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Month must be YYYY-MM format' });
    }
    if (amount === undefined || amount < 0) {
      return res.status(400).json({ message: 'Valid amount required' });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, month },
      { amount },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;