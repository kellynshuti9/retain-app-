import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { api } from '../api/client';
import type { Category, Expense, ExpenseDto, PaymentMethod } from '../types';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense?: Expense | null;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile', label: 'Mobile' },
];

const ExpenseForm = ({ open, onClose, onSuccess, expense }: ExpenseFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseDto>();

  useEffect(() => {
    if (!open) return;
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await api.get<Category[]>('/categories');
        setCategories(res.data);
      } catch {
        setError('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [open]);

  useEffect(() => {
    if (open && expense) {
      reset({
        title: expense.title,
        amount: expense.amount,
        category: expense.category._id,
        date: expense.date.slice(0, 10),
        paymentMethod: expense.paymentMethod,
        notes: expense.notes || '',
      });
    } else if (open && !expense) {
      reset({
        title: '',
        amount: 0,
        category: '',
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: 'card',
        notes: '',
      });
    }
  }, [open, expense, reset]);

  const onSubmit = async (data: ExpenseDto) => {
    try {
      setError('');
      const payload: ExpenseDto = {
        ...data,
        amount: Number(data.amount),
        date: data.date
          ? new Date(data.date).toISOString()
          : new Date().toISOString(),
      };

      if (expense) {
        await api.put(`/expenses/${expense._id}`, payload);
      } else {
        await api.post('/expenses', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save expense');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{expense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            label="Title"
            margin="normal"
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 2, message: 'At least 2 characters' },
            })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            fullWidth
            label="Amount"
            type="number"
            slotProps={{ htmlInput: { step: '0.01', min: '0.01' } }}
            margin="normal"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Must be greater than 0' },
              valueAsNumber: true,
            })}
            error={!!errors.amount}
            helperText={errors.amount?.message}
          />

          <TextField
            fullWidth
            select
            label="Category"
            margin="normal"
            disabled={loadingCategories}
            {...register('category', { required: 'Category is required' })}
            error={!!errors.category}
            helperText={errors.category?.message}
          >
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Payment Method"
            margin="normal"
            {...register('paymentMethod', { required: 'Payment method is required' })}
            error={!!errors.paymentMethod}
            helperText={errors.paymentMethod?.message}
          >
            {PAYMENT_METHODS.map((pm) => (
              <MenuItem key={pm.value} value={pm.value}>
                {pm.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Date"
            type="date"
            margin="normal"
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('date', { required: 'Date is required' })}
            error={!!errors.date}
            helperText={errors.date?.message}
          />

          <TextField
            fullWidth
            label="Notes (optional)"
            multiline
            rows={2}
            margin="normal"
            {...register('notes')}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || loadingCategories}
          >
            {isSubmitting ? <CircularProgress size={20} /> : expense ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ExpenseForm;