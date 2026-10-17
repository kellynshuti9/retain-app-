import express from 'express';
import Category from '../models/Category.js';
import Expense from '../models/Expense.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/categories  — any authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories  — admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/categories/:id  — admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot rename the default category' });
    }

    category.name = name;
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/categories/:id  — admin only, reassigns expenses
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot delete the default category' });
    }

    // Reassign any expenses using this category to "Uncategorized"
    const uncategorized = await Category.findOne({ name: 'Uncategorized' });
    if (!uncategorized) {
      return res.status(500).json({ message: 'Default category missing — seed may not have run' });
    }

    const result = await Expense.updateMany(
      { category: category._id },
      { category: uncategorized._id }
    );

    await category.deleteOne();

    res.json({
      message: 'Category deleted and expenses reassigned',
      reassignedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;