'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Chip, 
  Grid,
  Divider
} from '@mui/material';

// Definir la interfaz para las citas
interface Appointment {
  id: number;
  date: string;
  startTime: string;
  professional: { name: string };
  service: { name: string; price: number };
  status: string;
  paymentStatus: string;
  clientName: string;
}

export interface AppointmentCardProps {
  appointment: Appointment;
  onPay?: (appointmentId: number) => Promise<void>;
}

export function AppointmentCard({ appointment, onPay }: AppointmentCardProps) {
  // Determinar el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return 'warning';
      case 'CONFIRMADO':
        return 'success';
      case 'CANCELADO':
        return 'error';
      default:
        return 'default';
    }
  };

  // Determinar si el botón de pago debe estar deshabilitado
  const isPaymentDisabled = appointment.paymentStatus === 'PAGADO' || appointment.status === 'CANCELADO';

  return (
    <Card 
      sx={{ 
        mb: 2, 
        opacity: appointment.paymentStatus === 'PAGADO' ? 0.7 : 1,
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6" component="div" gutterBottom>
              {appointment.service.name}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
              <strong>Profesional:</strong> {appointment.professional.name}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
              <strong>Cliente:</strong> {appointment.clientName}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
              <strong>Fecha:</strong> {appointment.date}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
              <strong>Hora:</strong> {appointment.startTime}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box display="flex" flexDirection="column" alignItems="flex-end" height="100%" justifyContent="space-between">
              <Box>
                <Chip 
                  label={appointment.status} 
                  color={getStatusColor(appointment.status) as any}
                  sx={{ mb: 1 }}
                />
                
                <Typography variant="h6" align="right">
                  ${appointment.service.price.toLocaleString()}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" align="right">
                  {appointment.paymentStatus === 'PAGADO' ? 'Pagado' : 'Pendiente de pago'}
                </Typography>
              </Box>
              
              {onPay && (
                <Button 
                  variant="contained" 
                  color="primary"
                  disabled={isPaymentDisabled}
                  onClick={() => onPay(appointment.id)}
                  sx={{ mt: 2 }}
                >
                  {appointment.paymentStatus === 'PAGADO' ? 'Pagado' : 'Pagar'}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
    </Card>
  );
} 