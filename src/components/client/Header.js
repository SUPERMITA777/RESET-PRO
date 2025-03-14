import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, Container, Button, useScrollTrigger, Slide, Typography, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';

// Logo estilizado
const LogoImg = styled('img')({
  height: 50,
  marginRight: 16,
});

// Función para ocultar la barra al hacer scroll
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header = () => {
  const [logo, setLogo] = useState('/images/logo.png');
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Cargar el logo desde la API
    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/settings/logo');
        const data = await response.json();
        if (data.logoUrl) {
          setLogo(data.logoUrl);
        }
      } catch (error) {
        console.error('Error al cargar el logo:', error);
      }
    };

    fetchLogo();
  }, []);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <HideOnScroll>
      <AppBar position="fixed" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar>
            <Link href="/" passHref>
              <LogoImg src={logo || '/images/logo.png'} alt="Logo" />
            </Link>
            
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}
            >
              RESET PRO
            </Typography>

            {/* Menú para móviles */}
            {isMobile ? (
              <>
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenuClick}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleMenuClose}>
                    <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                      Inicio
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <Link href="/dashboard" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                      Dashboard
                    </Link>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              /* Menú para escritorio */
              <Box sx={{ display: 'flex' }}>
                <Button color="inherit" component={Link} href="/">
                  Inicio
                </Button>
                <Button color="inherit" component={Link} href="/dashboard">
                  Dashboard
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default Header; 