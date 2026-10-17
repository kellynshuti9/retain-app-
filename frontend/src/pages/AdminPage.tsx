import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { api } from '../api/client';
import AdminCategoryManager from '../components/AdminCategoryManager';
import type { AdminInsights } from '../types';

const AdminPage = () => {
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await api.get<AdminInsights>('/admin/insights');
        setInsights(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

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

  if (!insights) return null;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Users
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {insights.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Expenses
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {insights.totalExpenses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Value
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                ${insights.totalExpenseValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                This Month
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {insights.monthlyExpensesCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Spending by Category
            </Typography>
            {insights.spendingByCategory.length === 0 ? (
              <Typography sx={{ color: 'text.secondary' }}>No spending data yet.</Typography>
            ) : (
              insights.spendingByCategory.map((cat) => (
                <Box
                  key={cat.name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0 },
                  }}
                >
                  <Box>
                    <Typography>{cat.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {cat.count} expense{cat.count !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 'bold' }}>${cat.total.toFixed(2)}</Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top 5 Categories
            </Typography>
            {insights.topCategories.map((cat, i) => (
              <Box
                key={cat.name}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 0.75,
                }}
              >
                <Typography variant="body2">
                  {i + 1}. {cat.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {cat.count}×
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Bottom 5 Categories
            </Typography>
            {insights.bottomCategories.map((cat, i) => (
              <Box
                key={cat.name}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 0.75,
                }}
              >
                <Typography variant="body2">
                  {i + 1}. {cat.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {cat.count}×
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Expenses
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insights.recentExpenses.map((exp) => (
                    <TableRow key={exp._id}>
                      <TableCell>{exp.title}</TableCell>
                      <TableCell>{(exp.userId as any)?.name || '—'}</TableCell>
                      <TableCell align="right">${exp.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Users
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insights.recentUsers.map((u) => (
                    <TableRow key={u.email}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{u.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <AdminCategoryManager />
    </Box>
  );
};

export default AdminPage;