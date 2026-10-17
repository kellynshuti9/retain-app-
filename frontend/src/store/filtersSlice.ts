import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FiltersState, SortBy, SortOrder } from '../types';

const initialState: FiltersState = {
  search: '',
  category: '',
  paymentMethod: '',
  from: '',
  to: '',
  sortBy: 'date',
  order: 'desc',
  page: 1,
  limit: 10,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
      state.page = 1;
    },
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
      state.page = 1;
    },
    setDateRange: (state, action: PayloadAction<{ from: string; to: string }>) => {
      state.from = action.payload.from;
      state.to = action.payload.to;
      state.page = 1;
    },
    setSort: (state, action: PayloadAction<{ sortBy: SortBy; order: SortOrder }>) => {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setSearch,
  setCategory,
  setPaymentMethod,
  setDateRange,
  setSort,
  setPage,
  setLimit,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;