import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title too long'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'card', 'bank_transfer', 'mobile'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes too long'],
      default: '',
    },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;