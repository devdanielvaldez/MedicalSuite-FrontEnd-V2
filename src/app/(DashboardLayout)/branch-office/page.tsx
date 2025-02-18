'use client';

import React, { useState } from 'react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import BranchOfficesTable from './components/branchOfficeTable';
import RegisterBranchOfficeDialog from './components/branchOfficeRegister';

export interface BranchOffice {
  id: string;
  nameBranchOffice: string;
  branchOfficeDoctorId: number;
  phoneNumber: string;
}

const initialBranchOffices: any = [
  {
    "uuid": "a498db8d-1326-4ad8-b6cf-e0ff869a70d5",
    "embedding": null,
    "userCreatorId": 2,
    "userUpdatesId": null,
    "createdAt": "2025-02-17T18:19:05.740Z",
    "updatedAt": "2025-02-17T18:19:05.740Z",
    "deletedAt": null,
    "branchOfficeId": 1,
    "branchOfficeContactId": null,
    "branchOfficeAddressId": null,
    "branchOfficeDoctorId": null,
    "availableWorkDaysBranchOfficeId": null,
    "nameBranchOffice": "system"
  },
  {
    "uuid": "c2ecba7e-746b-4d12-8d5a-2ecd7dd464a3",
    "embedding": null,
    "userCreatorId": 3,
    "userUpdatesId": 3,
    "createdAt": "2025-02-17T21:42:02.684Z",
    "updatedAt": "2025-02-17T21:42:02.684Z",
    "deletedAt": null,
    "branchOfficeId": 2,
    "branchOfficeContactId": null,
    "branchOfficeAddressId": null,
    "branchOfficeDoctorId": 1,
    "availableWorkDaysBranchOfficeId": null,
    "nameBranchOffice": "Siglo 21"
  }
]

interface RegisterBranchOfficeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (newBranch: BranchOffice) => void;
}

const BranchOfficesList: React.FC = () => {
  const [branchOffices, setBranchOffices] = useState<BranchOffice[]>(initialBranchOffices);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchOffice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleSaveBranch = (newBranch: BranchOffice) => {
    setBranchOffices([...branchOffices, newBranch]);
  };

  const handleViewDetails = (branch: BranchOffice) => {
    setSelectedBranch(branch);
    setDetailOpen(true);
  };

  const handleCloseDetails = () => setDetailOpen(false);

  return (
    <PageContainer title="Consultorios" description="Gestión de consultorios">
      <Box sx={{ position: 'relative' }}>
            <BranchOfficesTable branchOffices={initialBranchOffices}></BranchOfficesTable>

        <RegisterBranchOfficeDialog open={openDialog} onClose={handleCloseDialog} />

        <Dialog open={detailOpen} onClose={handleCloseDetails} fullWidth maxWidth="sm">
          <DialogTitle>Detalles del Consultorio</DialogTitle>
          <DialogContent dividers>
            {selectedBranch && (
              <Box>
                <Typography variant="subtitle1">
                  <strong>Nombre:</strong> {selectedBranch.nameBranchOffice}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>ID del Doctor:</strong> {selectedBranch.branchOfficeDoctorId}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Teléfono:</strong> {selectedBranch.phoneNumber}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <Fab color="primary" onClick={handleOpenDialog}>
            <AddIcon />
          </Fab>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default BranchOfficesList;
