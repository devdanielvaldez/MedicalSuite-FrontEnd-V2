'use client';

import React, { useRef, useState } from 'react';
import {
  Box,
  Tooltip,
  Fab,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import PatientsTable, { PatientsTableMethods } from './components/patientsTable';
import RegisterPatientDialog from './components/registerPatients';


const PatientsList: React.FC = () => {
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);

  const patientsTableRef = useRef<PatientsTableMethods>(null);

  const handleRegister = () => {
    setOpenRegisterDialog(true);
  };

  const handleCloseRegisterDialog = () => {
    setOpenRegisterDialog(false);
    if (patientsTableRef.current) {
      patientsTableRef.current.refreshData();
    }
  };

  return (
    <PageContainer title="Lista de Pacientes" description="Gestión de pacientes">
      <Box sx={{ position: 'relative' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <PatientsTable ref={patientsTableRef} />
          </Grid>
        </Grid>
      </Box>

      <Tooltip title="Registrar Paciente" placement="left">
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
          onClick={handleRegister}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <RegisterPatientDialog open={openRegisterDialog} onClose={handleCloseRegisterDialog} />
    </PageContainer>
  );
};

export default PatientsList;