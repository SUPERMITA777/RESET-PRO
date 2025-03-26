import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, Container, Button, useScrollTrigger, Slide } from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';

// Logo estilizado
const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
}));

// Botón de navegación estilizado
const NavButton = styled(Button)(({ theme }) => ({
  color: 'white',
  margin: theme.spacing(0, 1),
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

// Función para ocultar la barra de navegación al desplazarse hacia abajo
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
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/settings/logo');
        if (response.ok) {
          const data = await response.json();
          if (data.logoUrl) {
            setLogo(data.logoUrl);
          }
        }
      } catch (error) {
        console.error('Error al cargar el logo:', error);
      }
    };

    fetchLogo();
  }, []);

  return (
    <HideOnScroll>
      <AppBar position="fixed" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Link href="/" passHref style={{ textDecoration: 'none', color: 'white' }}>
                <Box component="span" sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  Nombre del Negocio
                </Box>
              </Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NavButton href="#servicios">Servicios</NavButton>
              <NavButton href="#contacto">Contacto</NavButton>
              {logo && (
                <LogoContainer>
                  <img 
                    src={logo} 
                    alt="Logo" 
                    style={{ 
                      height: '50px', 
                      width: 'auto',
                      maxWidth: '100px',
                      objectFit: 'contain' 
                    }} 
                  />
                </LogoContainer>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default Header; 