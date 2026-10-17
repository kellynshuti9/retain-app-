import express from 'express';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

// GET /api/admin/insights
router.get('/insights', async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalExpenses,
      totalsAgg,
      monthlyExpensesCount,
      spendingByCategory,
      recentExpenses,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Expense.countDocuments(),
      Expense.aggregate([{ $group: { _id: null, sum: { $sum: '$amount' } } }]),
      Expense.countDocuments({ date: { $gte: monthStart } }),
      Expense.aggregate([
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryDoc',
          },
        },
        { $unwind: '$categoryDoc' },
        { $project: { _id: 0, name: '$categoryDoc.name', total: 1, count: 1 } },
      ]),
      Expense.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('category', 'name')
        .populate('userId', 'name email'),
      User.find().sort({ createdAt: -1 }).limit(10).select('name email role createdAt'),
    ]);

    const topCategories = [...spendingByCategory]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const bottomCategories = [...spendingByCategory]
      .sort((a, b) => a.count - b.count)
      .slice(0, 5);

    res.json({
      totalUsers,
      totalExpenses,
      totalExpenseValue: totalsAgg[0]?.sum || 0,
      monthlyExpensesCount,
      spendingByCategory,
      topCategories,
      bottomCategories,
      recentExpenses,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;