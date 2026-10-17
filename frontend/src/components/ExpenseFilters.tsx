import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
} from '@mui/material';
import { api } from '../api/client';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  resetFilters,
  setCategory,
  setDateRange,
  setPaymentMethod,
  setSearch,
  setSort,
} from '../store/filtersSlice';
import type { Category, PaymentMethod, SortBy, SortOrder } from '../types';

const ExpenseFilters = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<Category[]>('/categories');
        setCategories(res.data);
      } catch {
        // silent
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        dispatch(setSearch(localSearch));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, dispatch]);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '2fr 1fr 1fr 1fr 1fr',
          },
          gap: 2,
        }}
      >
        <TextField
          label="Search"
          size="small"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by title..."
        />

        <TextField
          select
          label="Category"
          size="small"
          value={filters.category}
          onChange={(e) => dispatch(setCategory(e.target.value))}
        >
          <MenuItem value="">All</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat._id} value={cat._id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Payment"
          size="small"
          value={filters.paymentMethod}
          onChange={(e) =>
            dispatch(setPaymentMethod(e.target.value as PaymentMethod | ''))
          }
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="cash">Cash</MenuItem>
          <MenuItem value="card">Card</MenuItem>
          <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
          <MenuItem value="mobile">Mobile</MenuItem>
        </TextField>

        <TextField
          label="From"
          type="date"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={filters.from}
          onChange={(e) =>
            dispatch(setDateRange({ from: e.target.value, to: filters.to }))
          }
        />

        <TextField
          label="To"
          type="date"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={filters.to}
          onChange={(e) =>
            dispatch(setDateRange({ from: filters.from, to: e.target.value }))
          }
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          select
          label="Sort by"
          size="small"
          value={filters.sortBy}
          onChange={(e) =>
            dispatch(setSort({ sortBy: e.target.value as SortBy, order: filters.order }))
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="date">Date</MenuItem>
          <MenuItem value="amount">Amount</MenuItem>
        </TextField>

        <TextField
          select
          label="Order"
          size="small"
          value={filters.order}
          onChange={(e) =>
            dispatch(setSort({ sortBy: filters.sortBy, order: e.target.value as SortOrder }))
          }
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="desc">Descending</MenuItem>
          <MenuItem value="asc">Ascending</MenuItem>
        </TextField>

        <Button variant="outlined" onClick={() => dispatch(resetFilters())}>
          Reset Filters
        </Button>
      </Box>
    </Paper>
  );
};

export default ExpenseFilters;