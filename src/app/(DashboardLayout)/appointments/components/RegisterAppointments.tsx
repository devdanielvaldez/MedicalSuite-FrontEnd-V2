'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Collapse,
  TextField,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide,
  SlideProps,
  Tooltip,
  useTheme,
  Grid,
  Fab,
  Autocomplete,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import CloseIcon from '@mui/icons-material/Close';

import { es } from 'date-fns/locale';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
const samplePatients = [
    { id: '1', name: 'Daniel Valdez' },
    { id: '2', name: 'Ana Martínez' },
    { id: '3', name: 'Luis Pérez' },
  ];
const Transition = React.forwardRef<unknown, SlideProps>(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const RegisterAppointmentModal = ({
    open,
    onClose,
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
    const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [appointmentReason, setAppointmentReason] = useState('');
  
    const disableWeekends = (date: Date) => {
      const day = date.getDay();
      return day === 0 || day === 6;
    };
  
    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      console.log({
        patient: selectedPatient,
        date: selectedDate,
        time: selectedTime,
        reason: appointmentReason,
      });
      onClose();
    };
  
    return (
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%)',
            p: 3,
            borderRadius: 2,
            boxShadow: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            position: 'relative',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          Registrar Cita
          <IconButton
            aria-label="cerrar"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.600',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ mt: 2 }}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              <Autocomplete
                options={samplePatients}
                getOptionLabel={(option) => option.name}
                value={selectedPatient}
                onChange={(event, newValue) => {
                  setSelectedPatient(newValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Paciente" variant="outlined" fullWidth />
                )}
              />
  
              <DatePicker
                label="Fecha"
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                }}
                minDate={new Date()}
                shouldDisableDate={(date) =>
                  disableWeekends(date) ||
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                slots={{ textField: TextField }}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    fullWidth: true,
                    InputLabelProps: { shrink: true },
                    sx: { transition: 'all 0.3s ease' },
                  },
                }}
              />
  
              <TimePicker
                label="Hora"
                value={selectedTime}
                onChange={(newValue) => {
                  setSelectedTime(newValue);
                }}
                ampm={false}
                slots={{ textField: TextField }}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    fullWidth: true,
                    InputLabelProps: { shrink: true },
                    sx: { transition: 'all 0.3s ease' },
                  },
                }}
              />
  
              <TextField
                label="Motivo de la cita"
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                sx={{ transition: 'all 0.3s ease' }}
              />
  
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                sx={{
                  mt: 2,
                  borderRadius: '8px',
                  paddingY: '10px',
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Guardar
              </Button>
            </Box>
          </LocalizationProvider>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default RegisterAppointmentModal;