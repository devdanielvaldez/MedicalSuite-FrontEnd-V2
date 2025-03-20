'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import WorkDaysTable from './components/workDaysTable';
import RegisterScheduleDialog from './components/registerDays';
import { toast, ToastContainer } from 'react-toastify';
import { httpRequest } from '@/app/utils/http';

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

const WorkSchedulesList: React.FC = () => {
  const [schedules, setSchedules] = useState<any>([]);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveSchedule = () => {
    toast.success("Horario registrado correctamente");
  };

  return (
    <PageContainer title="Horarios Laborales" description="Gestión de horarios laborales">
      <ToastContainer />
      <Box sx={{ position: 'relative' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <WorkDaysTable />
          </Grid>
        </Grid>

        <RegisterScheduleDialog open={openDialog} onClose={handleCloseDialog} onSave={handleSaveSchedule} />

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