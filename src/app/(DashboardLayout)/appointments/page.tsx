'use client';

import React, { useState } from 'react';
import {
  Box,
  Tooltip,
  useTheme,
  Grid,
  Fab,
} from '@mui/material';

import ScheduleIcon from '@mui/icons-material/Schedule';

import AddIcon from '@mui/icons-material/Add';


import PageContainer from '../components/container/PageContainer';
import ListAppointments from './components/ListAppointments';
import RegisterAppointmentModal from './components/RegisterAppointments';
import ViewTurnsModal from './components/Turns';

const samplePatients = [
  { id: '1', name: 'Daniel Valdez' },
  { id: '2', name: 'Ana Martínez' },
  { id: '3', name: 'Luis Pérez' },
];

const AppointmentsManagement = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isTurnsOpen, setIsTurnsOpen] = useState(false);
  const [turns, setTurns] = useState(samplePatients);
  const theme = useTheme();
  const isMobile = useTheme().breakpoints.down('sm');

  const handleOpenRegister = () => {
    setIsRegisterOpen(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
  };

  const handleOpenTurns = () => {
    setIsTurnsOpen(true);
  };

  const handleCloseTurns = () => {
    setIsTurnsOpen(false);
  };

  return (
    <PageContainer
      title="Gestión de Citas"
      description="Este es el panel para la gestión de citas"
    >
      <Box sx={{ position: 'relative' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ListAppointments />
          </Grid>
        </Grid>

        <Tooltip title="Registrar Cita" placement="left">
          <Fab
            color="primary"
            aria-label="registrar"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.1)' },
            }}
            onClick={handleOpenRegister}
          >
            <AddIcon />
          </Fab>
        </Tooltip>

        <Tooltip title="Ver Turnos" placement="left">
          <Fab
            color="secondary"
            aria-label="ver-turnos"
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.1)' },
            }}
            onClick={handleOpenTurns}
          >
            <ScheduleIcon />
          </Fab>
        </Tooltip>

        <RegisterAppointmentModal open={isRegisterOpen} onClose={handleCloseRegister} />

        <ViewTurnsModal open={isTurnsOpen} onClose={handleCloseTurns} turns={turns} setTurns={setTurns} />
      </Box>
    </PageContainer>
  );
};

export default AppointmentsManagement;