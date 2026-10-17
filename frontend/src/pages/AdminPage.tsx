import { Box, Paper, Typography } from '@mui/material';

const AdminPage = () => (
  <Box>
    <Typography variant="h4" sx={{ mb: 2 }}>
      Admin Dashboard
    </Typography>
    <Paper sx={{ p: 3 }}>
      <Typography sx={{ color: 'text.secondary' }}>
        Admin page — coming soon.
      </Typography>
    </Paper>
  </Box>
);

export default AdminPage;
