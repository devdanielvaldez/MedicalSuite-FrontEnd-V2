'use client';

import React, { useState } from 'react';
import {
  Box,
  Tooltip,
  Fab,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import PatientsTable, { Patient } from './components/patientsTable';
import RegisterPatientDialog from './components/registerPatients';

const patientsData: Patient[] = [
  { id: "1", name: "Juan Pérez", age: 30, phone: "+1 (555) 123-4567", cedula: "402-1164260-4" },
  { id: "2", name: "Ana Gómez", age: 25, phone: "+1 (555) 987-6543", cedula: "402-1164260-4" },
  { id: "3", name: "Carlos López", age: 40, phone: "+1 (555) 555-1212", cedula: "402-1164260-4" },
];

const PatientsList: React.FC = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);

  const handleToggleFilter = () => {
    setFilterOpen((prev) => !prev);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExport = () => {
    setExportAnchorEl(null);
  };

  const handleRegister = () => {
    // Abrir el dialog para registrar un nuevo paciente.
    setOpenRegisterDialog(true);
  };

  const handleCloseRegisterDialog = () => {
    setOpenRegisterDialog(false);
  };

  return (
    <PageContainer title="Lista de Pacientes" description="Gestión de pacientes">
      <Box sx={{ position: 'relative' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <PatientsTable patients={patientsData} />
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