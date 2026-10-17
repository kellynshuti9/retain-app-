import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../api/client';
import type { Category } from '../types';

const AdminCategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get<Category[]>('/categories');
      setCategories(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setName('');
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    try {
      setSaving(true);
      setError('');
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, { name });
      } else {
        await api.post('/categories', { name });
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const confirmed = window.confirm(
      `Delete "${cat.name}"? All expenses in this category will be moved to Uncategorized.`
    );
    if (!confirmed) return;
    try {
      setError('');
      await api.delete(`/categories/${cat._id}`);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Manage Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Category
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat._id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>
                  {cat.isDefault ? (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Default
                    </Typography>
                  ) : (
                    <Typography variant="caption">Custom</Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => openEdit(cat)}
                    disabled={cat.isDefault}
                    title={cat.isDefault ? 'Cannot edit the default category' : 'Rename'}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(cat)}
                    disabled={cat.isDefault}
                    title={cat.isDefault ? 'Cannot delete the default category' : 'Delete'}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingCategory ? 'Rename Category' : 'New Category'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminCategoryManager;