import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import ServiceList from '@/components/client/ServiceList';
import Header from '@/components/client/Header';

// Banner estilizado
const Banner = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '500px',
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/images/banner.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  textAlign: 'center',
  padding: theme.spacing(2),
  marginTop: '64px', // Espacio para la barra de navegación
}));

// Sección de información
const InfoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.background.default,
}));

// Tarjeta de información
const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10],
  },
}));

export default function Home() {
  return (
    <Box>
      {/* Encabezado con logo */}
      <Header />
      
      {/* Banner principal */}
      <Banner>
        <Box>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Tu Belleza, Nuestra Prioridad
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
            Descubre nuestros tratamientos exclusivos y agenda tu cita hoy mismo
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            href="#servicios"
            sx={{ 
              px: 4, 
              py: 1.5, 
              fontSize: '1.1rem',
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '30px',
            }}
          >
            Ver Servicios
          </Button>
        </Box>
      </Banner>

      {/* Sección de información */}
      <InfoSection>
        <Container>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 6 }}>
            ¿Por qué elegirnos?
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <InfoCard elevation={2}>
                <Box sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }}>✨</Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Profesionales Calificados
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Nuestro equipo está formado por profesionales con años de experiencia y formación continua.
                </Typography>
              </InfoCard>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <InfoCard elevation={2}>
                <Box sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }}>🛡️</Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Productos de Alta Calidad
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Utilizamos solo productos de primera calidad, garantizando resultados óptimos y seguros.
                </Typography>
              </InfoCard>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <InfoCard elevation={2}>
                <Box sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }}>⏱️</Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Reserva Fácil y Rápida
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Agenda tu cita en minutos a través de nuestro sistema online, disponible 24/7.
                </Typography>
              </InfoCard>
            </Grid>
          </Grid>
        </Container>
      </InfoSection>

      {/* Sección de servicios */}
      <Box id="servicios" sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
        <Container>
          <ServiceList />
        </Container>
      </Box>

      {/* Sección de contacto */}
      <Box id="contacto" sx={{ py: 8, backgroundColor: 'primary.main', color: 'white', textAlign: 'center' }}>
        <Container>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            ¿Tienes alguna pregunta?
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}>
            Estamos aquí para ayudarte. Contáctanos por WhatsApp o visita nuestro local.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary"
            size="large"
            href="https://wa.me/5491123456789"
            target="_blank"
            sx={{ 
              px: 4, 
              py: 1.5, 
              fontSize: '1.1rem',
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '30px',
              backgroundColor: '#25D366',
              '&:hover': {
                backgroundColor: '#128C7E',
              }
            }}
          >
            Contactar por WhatsApp
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: '#333', color: 'white' }}>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Nombre del Negocio
              </Typography>
              <Typography variant="body2">
                Dirección: Av. Ejemplo 1234, Ciudad<br />
                Teléfono: (123) 456-7890<br />
                Email: info@ejemplo.com
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2" sx={{ mt: { xs: 2, md: 0 } }}>
                Horario de atención:<br />
                Lunes a Viernes: 9:00 - 20:00<br />
                Sábados: 10:00 - 15:00
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                © {new Date().getFullYear()} Nombre del Negocio. Todos los derechos reservados.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
} 