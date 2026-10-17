import { Box, Button, Paper, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, signout } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">Welcome, {user?.name}!</Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Role: {user?.role}
        </Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={signout}>
          Sign Out
        </Button>
      </Paper>
    </Box>
  );
};

export default DashboardPage;