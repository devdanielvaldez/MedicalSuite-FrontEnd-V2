'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  TextField,
  Typography,
  CircularProgress,
  Slide,
} from '@mui/material';
import {
  LocalizationProvider,
  StaticDatePicker,
  PickersDay,
  PickersDayProps,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';
import isSameDay from 'date-fns/isSameDay';
import isBefore from 'date-fns/isBefore';
import startOfDay from 'date-fns/startOfDay';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TransitionProps } from '@mui/material/transitions';
import { httpRequest } from '@/app/utils/http';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BlockDateCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [blockAllDay, setBlockAllDay] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [blockDates, setBlockDates] = useState<any>([]);

  const fetchBlockDates = async () => {
    try {
      const res: any = await httpRequest({
        url:
          '/block-dates/by-branch-office/' +
          localStorage.getItem('selectedBranchOffice'),
        method: 'GET',
        requiresAuth: true,
      });
      if (res.data) {
        setBlockDates(res.data);
      }
      console.log('BlockDates:', res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchBlockDates();
  }, []);

  const getBlockInfoForDate = (date: Date): any | undefined => {
    return blockDates.find((bd: any) => isSameDay(new Date(bd.dateBlock), date));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const today = startOfDay(new Date());
      if (isBefore(date, today)) {
        toast.info('No se puede bloquear una fecha pasada.');
        return;
      }

      const blockInfoForDate = getBlockInfoForDate(date);
      if (blockInfoForDate && blockInfoForDate.blockAllDay) {
        toast.info('El día está bloqueado completo y no se puede modificar.');
        setSelectedDate(date);
        return;
      }
      setSelectedDate(date);
      setModalOpen(true);
      setStartTime('');
      setEndTime('');
      setBlockAllDay(false);
    }
  };

  const validateModal = (): boolean => {
    if (!selectedDate) {
      toast.error('No se ha seleccionado una fecha.');
      return false;
    }
    if (!blockAllDay) {
      if (!startTime || !endTime) {
        toast.error('Ingrese la hora de inicio y la hora final.');
        return false;
      }
      const convertTimeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      if (convertTimeToMinutes(startTime) >= convertTimeToMinutes(endTime)) {
        toast.error('La hora final debe ser mayor a la hora de inicio.');
        return false;
      }
    }
    return true;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time: string): string => {
    return time.length === 5 ? `${time}:00` : time;
  };

  

  const handleSave = async () => {
    if (!validateModal()) return;
    setIsSaving(true);

    const payload = {
      dateBlock: selectedDate,
      startTime: blockAllDay ? '' : formatTime(startTime),
      endTime: blockAllDay ? '' : formatTime(endTime),
      blockAllDay,
      branchOfficeId: Number(localStorage.getItem('selectedBranchOffice')),
    };

    try {
      await httpRequest({
        method: 'POST',
        url: '/block-dates',
        data: payload,
        requiresAuth: true,
      });
      toast.success('Fecha bloqueada correctamente');
      setModalOpen(false);
      fetchBlockDates();
    } catch (error) {
      console.error('Error al bloquear la fecha:', error);
      toast.error('Ocurrió un error al bloquear la fecha.');
    } finally {
      setIsSaving(false);
    }
  };

  const CustomPickersDay = (props: PickersDayProps<Date>) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const today = startOfDay(new Date());
    const isPast = isBefore(day, today);
    const isBlocked = blockDates.some((bd: any) =>
      isSameDay(new Date(bd.dateBlock), day)
    );

    return (
      <PickersDay
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        {...other}
        sx={{
          backgroundColor: isPast
            ? 'grey.300'
            : isBlocked
            ? 'error.main'
            : 'success.main',
          color: isPast ? 'grey.600' : isBlocked ? '#fff' : '#000',
          borderRadius: '50%',
          pointerEvents: isPast ? 'none' : 'auto',
          '&:hover': {
            backgroundColor: isPast
              ? 'grey.300'
              : isBlocked
              ? 'error.dark'
              : 'success.dark',
          },
        }}
      />
    );
  };

  const blockInfo = selectedDate ? getBlockInfoForDate(selectedDate) : null;

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom>
        Seleccione una fecha para bloquear
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'error.main' }} />
          <Typography variant="body2">Bloqueado</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'success.main' }} />
          <Typography variant="body2">Disponible</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: 2,
            p: 2,
            flex: 1,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
            <StaticDatePicker
              disablePast
              displayStaticWrapperAs="desktop"
              openTo="day"
              value={selectedDate}
              onChange={handleDateChange}
              slots={{ day: CustomPickersDay }}
            />
          </LocalizationProvider>
        </Box>
        <Box
          sx={{
            flex: 1,
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 2,
            height: 'fit-content',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Información del día
          </Typography>
          {selectedDate && blockInfo ? (
            blockInfo.blockAllDay ? (
              <Typography variant="body1" color="error.main">
                El día está bloqueado completo
              </Typography>
            ) : (
              <Typography variant="body1" color="error.main">
                Bloqueado de {blockInfo.startTime} a {blockInfo.endTime}
              </Typography>
            )
          ) : (
            <Typography variant="body1" color="success.main">
              El día está disponible
            </Typography>
          )}
        </Box>
      </Box>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
      >
        <DialogTitle>
          Bloquear Fecha: {selectedDate ? formatDate(selectedDate) : ''}
        </DialogTitle>
        <DialogContent dividers>
          <FormControlLabel
            control={
              <Checkbox
                checked={blockAllDay}
                onChange={(e) => setBlockAllDay(e.target.checked)}
              />
            }
            label="Bloquear todo el día"
          />
          {!blockAllDay && (
            <>
              <TextField
                label="Hora de Inicio"
                type="time"
                fullWidth
                margin="normal"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
              />
              <TextField
                label="Hora Final"
                type="time"
                fullWidth
                margin="normal"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlockDateCalendar;