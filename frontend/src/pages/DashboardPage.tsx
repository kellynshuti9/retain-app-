import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { BudgetStatusResponse, ExpensesResponse } from '../types';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalSpent, setTotalSpent] = useState(0);
  const [budgetData, setBudgetData] = useState<BudgetStatusResponse | null>(null);
  const [highestExpense, setHighestExpense] = useState<{ title: string; amount: number } | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<ExpensesResponse['expenses']>([]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const budgetRes = await api.get<BudgetStatusResponse>(`/budgets/${currentMonth}`);
        setBudgetData(budgetRes.data);
        setTotalSpent(budgetRes.data.totalSpent);

        const expensesRes = await api.get<ExpensesResponse>('/expenses', {
          params: { limit: 5, sortBy: 'date', order: 'desc' },
        });
        setRecentExpenses(expensesRes.data.expenses);

        const highestRes = await api.get<ExpensesResponse>('/expenses', {
          params: { sortBy: 'amount', order: 'desc', limit: 1 },
        });
        const top = highestRes.data.expenses[0];
        if (top) setHighestExpense({ title: top.title, amount: top.amount });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [currentMonth]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const remaining = budgetData?.remaining ?? 0;
  const budgetAmount = budgetData?.budget ?? 0;

  const statusLabel =
    budgetData?.status === 'over'
      ? 'Over Budget'
      : budgetData?.status === 'approaching'
      ? 'Approaching Budget'
      : budgetData?.status === 'no_budget'
      ? 'No budget set'
      : 'Within Budget';

  const statusColor =
    budgetData?.status === 'over'
      ? 'error.main'
      : budgetData?.status === 'approaching'
      ? 'warning.main'
      : 'success.main';

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Welcome, {user?.name}!
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Here's your spending summary for {currentMonth}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Spent
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                ${totalSpent.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {currentMonth}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Remaining Budget
              </Typography>
              <Typography
                variant="h4"
                sx={{ mt: 1, color: remaining < 0 ? 'error.main' : 'text.primary' }}
              >
                {budgetAmount > 0 ? `$${remaining.toFixed(2)}` : 'Not set'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {budgetAmount > 0 ? `of $${budgetAmount.toFixed(2)}` : 'Set a budget'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Budget Status
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: statusColor }}>
                {statusLabel}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Highest Expense
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {highestExpense ? `$${highestExpense.amount.toFixed(2)}` : '—'}
              </Typography>
              {highestExpense && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                  {highestExpense.title}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Expenses
              </Typography>
              {recentExpenses.length === 0 ? (
                <Typography sx={{ color: 'text.secondary' }}>
                  No expenses yet. Start adding some!
                </Typography>
              ) : (
                recentExpenses.map((exp) => (
                  <Box
                    key={exp._id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      borderBottom: 1,
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <Box>
                      <Typography>{exp.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {exp.category.name} · {new Date(exp.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      ${exp.amount.toFixed(2)}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;