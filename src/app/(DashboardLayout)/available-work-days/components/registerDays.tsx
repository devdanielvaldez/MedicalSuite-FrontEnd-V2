'use client';

import React, { useState } from 'react';
import {
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
  CircularProgress,
  Box,
} from '@mui/material';
import { httpRequest } from '@/app/utils/http';
import AddIcon from '@mui/icons-material/Add';
import { toast, ToastContainer } from 'react-toastify';

interface WorkHour {
  startTime: string;
  endTime: string;
  patientLimit: number | string;
}

interface RegisterScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const RegisterScheduleDialog: React.FC<RegisterScheduleDialogProps> = ({ open, onClose, onSave }) => {
  const [day, setDay] = useState<string>('');
  const [workHours, setWorkHours] = useState<WorkHour[]>([
    { startTime: '', endTime: '', patientLimit: '' },
  ]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const validateWorkHours = (): boolean => {
    for (let i = 0; i < workHours.length; i++) {
      const { startTime, endTime, patientLimit } = workHours[i];
      if (!startTime || !endTime || patientLimit === '') {
        toast.error("Por favor, complete todos los campos de cada rango de horario.");
        return false;
      }
      if (convertTimeToMinutes(startTime) >= convertTimeToMinutes(endTime)) {
        toast.error(`El rango ${i + 1}: La hora final debe ser mayor a la hora inicial.`);
        return false;
      }
      if (isNaN(Number(patientLimit)) || Number(patientLimit) <= 0) {
        toast.error(`El rango ${i + 1}: El límite de pacientes debe ser un número mayor a 0.`);
        return false;
      }
    }

    for (let i = 0; i < workHours.length; i++) {
      for (let j = i + 1; j < workHours.length; j++) {
        const startI = convertTimeToMinutes(workHours[i].startTime);
        const endI = convertTimeToMinutes(workHours[i].endTime);
        const startJ = convertTimeToMinutes(workHours[j].startTime);
        const endJ = convertTimeToMinutes(workHours[j].endTime);
        if (startI < endJ && startJ < endI) {
          toast.error(`Los rangos ${i + 1} y ${j + 1} se solapan.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleAddWorkHour = () => {
    setWorkHours((prev) => [
      ...prev,
      { startTime: '', endTime: '', patientLimit: '' },
    ]);
  };

  const handleRemoveWorkHour = (index: number) => {
    setWorkHours((prev) => prev.filter((_, i) => i !== index));
  };

  const handleWorkHourChange = (index: number, field: keyof WorkHour, value: string) => {
    setWorkHours((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    if (!day) {
      toast.error("Por favor, seleccione el día de la semana.");
      return;
    }
    if (!validateWorkHours()) {
      return;
    }

    setIsSaving(true);

    const payload = {
      dayOfWeek: +day,
      branchOfficeId: +localStorage.getItem('selectedBranchOffice')!,
      workHours: workHours.map((wh) => ({
        startTime: wh.startTime,
        endTime: wh.endTime,
        patientLimit: typeof wh.patientLimit === 'string' ? parseInt(wh.patientLimit, 10) : wh.patientLimit,
      })),
      isActive: true
    };

    try {
      await httpRequest({
        method: 'POST',
        url: '/available-work-days',
        data: payload,
        requiresAuth: true,
      });
      onSave();
      setDay('');
      setWorkHours([{ startTime: '', endTime: '', patientLimit: '' }]);
      onClose();
    } catch (error: any) {
      toast.error(error.data.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <ToastContainer />
      <DialogTitle>Registrar Horario Laboral</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Día de la Semana</InputLabel>
          <Select
            value={day}
            label="Día de la Semana"
            onChange={(e) => setDay(e.target.value)}
          >
            <MenuItem value="1">Domingo</MenuItem>
            <MenuItem value="2">Lunes</MenuItem>
            <MenuItem value="3">Martes</MenuItem>
            <MenuItem value="4">Miércoles</MenuItem>
            <MenuItem value="5">Jueves</MenuItem>
            <MenuItem value="6">Viernes</MenuItem>
            <MenuItem value="7">Sábado</MenuItem>
          </Select>
        </FormControl>
        {workHours.map((wh, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection="column"
            gap={2}
            mt={2}
            border={1}
            borderColor="grey.300"
            borderRadius={2}
            p={2}
          >
            <TextField
              label="Hora de Inicio"
              type="time"
              fullWidth
              value={wh.startTime}
              onChange={(e) => handleWorkHourChange(index, 'startTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 60 }}
            />
            <TextField
              label="Hora Final"
              type="time"
              fullWidth
              value={wh.endTime}
              onChange={(e) => handleWorkHourChange(index, 'endTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 60 }}
            />
            <TextField
              label="Límite de Pacientes"
              type="number"
              fullWidth
              value={wh.patientLimit}
              onChange={(e) => handleWorkHourChange(index, 'patientLimit', e.target.value)}
            />
            {workHours.length > 1 && (
              <Button variant="outlined" color="error" onClick={() => handleRemoveWorkHour(index)}>
                Eliminar Rango
              </Button>
            )}
          </Box>
        ))}
        <Button
          variant="outlined"
          onClick={handleAddWorkHour}
          startIcon={<AddIcon />}
          sx={{ mt: 2 }}
        >
          Agregar Horario
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterScheduleDialog;