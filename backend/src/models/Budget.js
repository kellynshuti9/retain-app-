import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, 'Month must be YYYY-MM format'],
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0, 'Budget cannot be negative'],
    },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;