import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../api/client';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setPage } from '../store/filtersSlice';
import ExpenseFilters from '../components/ExpenseFilters';
import ExpenseForm from '../components/ExpenseForm';
import type { Expense, ExpensesResponse } from '../types';

const ExpensesPage = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);

  const [data, setData] = useState<ExpensesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params: Record<string, string | number> = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        order: filters.order,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await api.get<ExpensesResponse>('/expenses', { params });
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleCreate = () => {
    setEditingExpense(null);
    setFormOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Expenses</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add Expense
        </Button>
      </Box>

      <ExpenseFilters />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !data || data.expenses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary' }}>
            No expenses found.{' '}
            {filters.search || filters.category || filters.from
              ? 'Try adjusting your filters.'
              : 'Add your first expense!'}
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.expenses.map((exp) => (
                  <TableRow key={exp._id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>{exp.title}</Typography>
                      {exp.notes && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {exp.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{exp.category.name}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {exp.paymentMethod.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 'bold' }}>
                        ${exp.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(exp)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(exp._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
            <Pagination
              count={data.pagination.totalPages}
              page={filters.page}
              onChange={(_, page) => dispatch(setPage(page))}
              color="primary"
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Showing {data.expenses.length} of {data.pagination.total} expenses
            </Typography>
          </Stack>
        </>
      )}

      <ExpenseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchExpenses}
        expense={editingExpense}
      />
    </Box>
  );
};

export default ExpensesPage;