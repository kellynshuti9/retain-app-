import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { api } from '../api/client';
import type { BudgetStatusResponse } from '../types';

const BudgetPage = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<BudgetStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBudget = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get<BudgetStatusResponse>(`/budgets/${month}`);
      setData(res.data);
      setBudgetInput(res.data.budget.toString());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [month]);

  const handleSave = async () => {
    const amount = Number(budgetInput);
    if (isNaN(amount) || amount < 0) {
      setError('Budget must be a positive number');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await api.put(`/budgets/${month}`, { amount });
      setSuccessMsg('Budget saved!');
      await fetchBudget();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const statusColor =
    data?.status === 'over'
      ? 'error'
      : data?.status === 'approaching'
      ? 'warning'
      : 'success';

  const statusMessage =
    data?.status === 'over'
      ? "You're over budget for this month."
      : data?.status === 'approaching'
      ? "You're approaching your budget limit."
      : data?.status === 'no_budget'
      ? 'Set a budget to start tracking.'
      : "You're within budget. Great job!";

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Monthly Budget
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Budget amount"
            type="number"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Budget'}
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : data ? (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Budget
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    ${data.budget.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Spent
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    ${data.totalSpent.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Remaining
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ mt: 1, color: data.remaining < 0 ? 'error.main' : 'success.main' }}
                  >
                    ${data.remaining.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Budget Progress
              </Typography>

              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(data.percentUsed, 100)}
                  color={statusColor}
                  sx={{ height: 12, borderRadius: 6 }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {data.percentUsed.toFixed(1)}% used
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {month}
                </Typography>
              </Box>

              <Alert
                severity={
                  data.status === 'over'
                    ? 'error'
                    : data.status === 'approaching'
                    ? 'warning'
                    : data.status === 'no_budget'
                    ? 'info'
                    : 'success'
                }
              >
                {statusMessage}
              </Alert>
            </CardContent>
          </Card>
        </>
      ) : null}
    </Box>
  );
};

export default BudgetPage;