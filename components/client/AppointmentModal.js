import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Grid, 
  TextField,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { format, addDays, isWeekend } from 'date-fns';

const AppointmentModal = ({ open, onClose, service }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    whatsapp: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !service) return;

    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/availability?date=${formattedDate}&serviceId=${service.id}`);
      const data = await response.json();
      setAvailableSlots(data.slots);
    } catch (error) {
      console.error('Error al cargar horarios disponibles:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateContactInfo = () => {
    const newErrors = {};
    
    if (!contactInfo.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!contactInfo.whatsapp.trim()) {
      newErrors.whatsapp = 'El número de WhatsApp es requerido';
    } else if (!/^\d{10,15}$/.test(contactInfo.whatsapp.replace(/\D/g, ''))) {
      newErrors.whatsapp = 'Ingrese un número de WhatsApp válido';
    }
    
    if (contactInfo.email && !/\S+@\S+\.\S+/.test(contactInfo.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedDate) {
      return;
    }
    
    if (activeStep === 1 && !selectedSlot) {
      return;
    }
    
    if (activeStep === 2) {
      if (!validateContactInfo()) {
        return;
      }
    }
    
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateContactInfo()) {
      return;
    }
    
    setSubmitting(true);
    try {
      const appointmentData = {
        serviceId: service.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedSlot,
        status: 'PENDIENTE',
        clientName: contactInfo.name,
        clientWhatsapp: contactInfo.whatsapp,
        clientEmail: contactInfo.email || null
      };
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        throw new Error('Error al agendar el turno');
      }
      
      // Avanzar al paso de confirmación
      setActiveStep(4);
    } catch (error) {
      console.error('Error al agendar el turno:', error);
      alert('Hubo un error al agendar el turno. Por favor, inténtelo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedDate(null);
    setSelectedSlot(null);
    setContactInfo({
      name: '',
      whatsapp: '',
      email: '',
    });
    setErrors({});
    onClose();
  };

  // Generar fechas disponibles (próximos 30 días, excluyendo fines de semana)
  const getDisabledDates = (date) => {
    return isWeekend(date) || date < new Date();
  };

  // Renderizar el contenido según el paso activo
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Selecciona una fecha
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha"
                value={selectedDate}
                onChange={handleDateChange}
                shouldDisableDate={getDisabledDates}
                minDate={new Date()}
                maxDate={addDays(new Date(), 30)}
                sx={{ width: '100%', mt: 2 }}
              />
            </LocalizationProvider>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Selecciona un horario
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : availableSlots.length > 0 ? (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {availableSlots.map((slot) => (
                  <Grid item xs={6} sm={4} key={slot}>
                    <Button
                      variant={selectedSlot === slot ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      onClick={() => handleSlotSelect(slot)}
                    >
                      {slot}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No hay horarios disponibles para la fecha seleccionada. Por favor, selecciona otra fecha.
              </Typography>
            )}
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ingresa tus datos de contacto
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Nombre completo"
                  fullWidth
                  value={contactInfo.name}
                  onChange={handleInputChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="whatsapp"
                  label="WhatsApp"
                  fullWidth
                  value={contactInfo.whatsapp}
                  onChange={handleInputChange}
                  error={!!errors.whatsapp}
                  helperText={errors.whatsapp}
                  required
                  placeholder="Ej: 1123456789"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="Correo electrónico (opcional)"
                  fullWidth
                  value={contactInfo.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 3:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Confirma tu turno
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {service?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ${service?.price} • {service?.duration} min
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha
                  </Typography>
                  <Typography variant="body1">
                    {selectedDate ? format(selectedDate, 'EEEE dd/MM/yyyy', { locale: es }) : ''}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Hora
                  </Typography>
                  <Typography variant="body1">
                    {selectedSlot}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Nombre
                  </Typography>
                  <Typography variant="body1">
                    {contactInfo.name}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    WhatsApp
                  </Typography>
                  <Typography variant="body1">
                    {contactInfo.whatsapp}
                  </Typography>
                </Grid>
                {contactInfo.email && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Correo electrónico
                    </Typography>
                    <Typography variant="body1">
                      {contactInfo.email}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
            <Typography variant="body2" color="text.secondary">
              Tu turno quedará en estado PENDIENTE hasta que sea confirmado por un administrador.
            </Typography>
          </Box>
        );
      
      case 4:
        return (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom color="primary">
              ¡Turno agendado con éxito!
            </Typography>
            <Typography variant="body1" paragraph>
              Hemos recibido tu solicitud de turno. Un administrador confirmará tu reserva a la brevedad.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Te contactaremos a través de WhatsApp para confirmar tu turno.
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };

  if (!service) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {activeStep < 4 ? `Agendar: ${service?.name}` : 'Reserva Completada'}
      </DialogTitle>
      
      <DialogContent dividers>
        {activeStep < 4 && (
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Fecha</StepLabel>
            </Step>
            <Step>
              <StepLabel>Horario</StepLabel>
            </Step>
            <Step>
              <StepLabel>Datos</StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirmar</StepLabel>
            </Step>
          </Stepper>
        )}
        
        {renderStepContent()}
      </DialogContent>
      
      <DialogActions>
        {activeStep < 4 ? (
          <>
            <Button onClick={handleClose}>Cancelar</Button>
            {activeStep > 0 && (
              <Button onClick={handleBack}>
                Atrás
              </Button>
            )}
            {activeStep < 3 ? (
              <Button 
                onClick={handleNext}
                variant="contained"
                disabled={
                  (activeStep === 0 && !selectedDate) ||
                  (activeStep === 1 && !selectedSlot)
                }
              >
                Siguiente
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Confirmar Turno'}
              </Button>
            )}
          </>
        ) : (
          <Button onClick={handleClose} variant="contained">
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentModal; 