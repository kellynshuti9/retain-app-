import express from 'express';
import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const {
      search, category, paymentMethod, from, to,
      sortBy = 'date', order = 'desc',
      page = '1', limit = '10',
    } = req.query;

    const filter = { userId: req.user._id };

    if (search) filter.title = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const sortField = sortBy === 'amount' ? 'amount' : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('category', 'name isDefault')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Expense.countDocuments(filter),
    ]);

    res.json({
      expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/expenses/:id
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('category', 'name isDefault');

    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, paymentMethod, notes } = req.body;

    if (!title || !amount || !category || !paymentMethod) {
      return res.status(400).json({ message: 'Title, amount, category, paymentMethod required' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title, amount, category,
      date: date || new Date(),
      paymentMethod,
      notes: notes || '',
    });

    const populated = await expense.populate('category', 'name isDefault');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const { title, amount, category, date, paymentMethod, notes } = req.body;
    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = date;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();
    const populated = await expense.populate('category', 'name isDefault');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    res.json({ message: 'Expense deleted', id: expense._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;