'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import WorkDaysTable from './components/workDaysTable';

export interface WorkSchedule {
  id: string;
  day: string;
  isActive: string;
  startTime: string;
  endTime: string;
  limit: number;
}

const workSchedules: WorkSchedule[] = [
  { id: '1', day: 'Lunes', isActive: "Si", startTime: '08:00', endTime: '17:00', limit: 10 },
  { id: '2', day: 'Martes', isActive: "Si", startTime: '09:00', endTime: '18:00', limit: 12 },
  { id: '3', day: 'Miércoles', isActive: "No", startTime: '08:30', endTime: '16:30', limit: 8 },
  { id: '4', day: 'Jueves', isActive: "Si", startTime: '08:00', endTime: '17:00', limit: 10 },
  { id: '5', day: 'Viernes', isActive: "Si", startTime: '08:00', endTime: '16:00', limit: 9 },
];

interface RegisterScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (newSchedule: WorkSchedule) => void;
}

const RegisterScheduleDialog: React.FC<RegisterScheduleDialogProps> = ({ open, onClose, onSave }) => {
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [limit, setLimit] = useState<number | string>('');

  const handleSave = () => {
    const newSchedule: WorkSchedule = {
      id: Math.random().toString(36).substr(2, 9),
      day,
      isActive: "Si",
      startTime,
      endTime,
      limit: typeof limit === 'string' ? parseInt(limit, 10) : limit,
    };
    onSave(newSchedule);
    // Reiniciar campos
    setDay('');
    setStartTime('');
    setEndTime('');
    setLimit('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar Horario Laboral</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Día de la Semana</InputLabel>
          <Select
            value={day}
            label="Día de la Semana"
            onChange={(e) => setDay(e.target.value)}
          >
            <MenuItem value="Domingo">Domingo</MenuItem>
            <MenuItem value="Lunes">Lunes</MenuItem>
            <MenuItem value="Martes">Martes</MenuItem>
            <MenuItem value="Miércoles">Miércoles</MenuItem>
            <MenuItem value="Jueves">Jueves</MenuItem>
            <MenuItem value="Viernes">Viernes</MenuItem>
            <MenuItem value="Sábado">Sábado</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Hora de Inicio"
          type="time"
          fullWidth
          margin="normal"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Hora Final"
          type="time"
          fullWidth
          margin="normal"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Límite de Pacientes"
          type="number"
          fullWidth
          margin="normal"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const WorkSchedulesList: React.FC = () => {
  const [schedules, setSchedules] = useState<WorkSchedule[]>(workSchedules);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveSchedule = (newSchedule: WorkSchedule) => {
    setSchedules([...schedules, newSchedule]);
  };

  return (
    <PageContainer title="Horarios Laborales" description="Gestión de horarios laborales">
      <Box sx={{ position: 'relative' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <WorkDaysTable workDays={schedules} />
          </Grid>
        </Grid>
        {/* Diálogo para registrar nuevo horario */}
        <RegisterScheduleDialog open={openDialog} onClose={handleCloseDialog} onSave={handleSaveSchedule} />
        {/* Botón flotante para registrar */}
        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <Fab color="primary" onClick={handleOpenDialog}>
            <AddIcon />
          </Fab>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default WorkSchedulesList;