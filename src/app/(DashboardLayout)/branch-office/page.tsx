'use client';

import React, { useEffect, useState } from 'react';
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
import BranchOfficesTable, { BranchOffice } from './components/branchOfficeTable';
import RegisterBranchOfficeDialog, { BranchOfficeEditData } from './components/branchOfficeRegister';
import { httpRequest } from '@/app/utils/http';

const BranchOfficesList: React.FC = () => {
  const [branchOffices, setBranchOffices] = useState<BranchOffice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranchEdit, setSelectedBranchEdit] = useState<BranchOfficeEditData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBranchDetails, setSelectedBranchDetails] = useState<BranchOffice | null>(null);

  const fetchBranchOffices = async () => {
    setLoading(true);
    try {
      const response: any = await httpRequest({
        method: 'GET',
        url: '/branch-office/get-all-by-doctor',
        requiresAuth: true,
      });
      setBranchOffices(response);
    } catch (error) {
      console.error("Error fetching branch offices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchOffices();
  }, []);

  // Transformar el branch office a BranchOfficeEditData para el formulario de edición
  const handleEdit = (bo: BranchOffice) => {
    const editData: BranchOfficeEditData = {
      branchOfficeId: bo.branchOfficeId,
      uuid: bo.uuid,
      nameBranchOffice: bo.nameBranchOffice,
      createOrUpdateContactDto: {
        // Si la data no incluye contactos, se usan valores por defecto
        uuid: "",
        phoneNumbers: bo.phoneNumber ? [{ phoneNumber: bo.phoneNumber, typePhone: 'cellphone', label: 'TEL_OFFICE', country: 'DO' }] : [{ phoneNumber: '', typePhone: 'cellphone', label: 'TEL_OFFICE', country: 'DO' }],
        socialNetworks: []
      }
    };
    setSelectedBranchEdit(editData);
    setOpenDialog(true);
  };

  const handleShowDetails = (bo: BranchOffice) => {
    setSelectedBranchDetails(bo);
    setDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailOpen(false);
    setSelectedBranchDetails(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBranchEdit(null);
  };

  // Función onSave para refrescar la lista tras guardar (registro o edición)
  const handleSaveBranch = (newBranch: any) => {
    fetchBranchOffices();
  };

  return (
    <PageContainer title="Consultorios" description="Gestión de consultorios">
      <Box sx={{ position: 'relative' }}>
        <BranchOfficesTable
          branchOffices={branchOffices}
          loading={loading}
          onEdit={handleEdit}
          onShowDetails={handleShowDetails}
        />

        <RegisterBranchOfficeDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSave={handleSaveBranch}
          editData={selectedBranchEdit || undefined}
        />

        <Dialog open={detailOpen} onClose={handleCloseDetails} fullWidth maxWidth="sm">
          <DialogTitle>Detalles del Consultorio</DialogTitle>
          <DialogContent dividers>
            {selectedBranchDetails && (
              <Box>
                <Typography variant="subtitle1">
                  <strong>Nombre:</strong> {selectedBranchDetails.nameBranchOffice}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Teléfono:</strong> {selectedBranchDetails.phoneNumber || 'N/A'}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <Fab color="primary" onClick={() => { setOpenDialog(true); setSelectedBranchEdit(null); }}>
            <AddIcon />
          </Fab>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default BranchOfficesList;