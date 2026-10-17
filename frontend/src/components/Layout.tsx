import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Expenses', path: '/expenses' },
    { label: 'Budget', path: '/budget' },
    ...(user?.role === 'admin' ? [{ label: 'Admin', path: '/admin' }] : []),
  ];

  const handleSignOut = () => {
    signout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={RouterLink}
            to="/dashboard"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              mr: 4,
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Retain
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  sx={{
                    borderBottom:
                      location.pathname === item.path ? '2px solid white' : '2px solid transparent',
                    borderRadius: 0,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {user?.name}
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user?.email}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption">Role: {user?.role}</Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  handleSignOut();
                }}
              >
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate(item.path);
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Retain — Personal Expense Manager
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;