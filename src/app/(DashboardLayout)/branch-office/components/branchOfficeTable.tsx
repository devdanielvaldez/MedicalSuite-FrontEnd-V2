'use client';

import React, { useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardCard from '../../components/shared/DashboardCard';

import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';

interface BranchOfficesTableProps {
  branchOffices: any;
}

const BranchOfficesTable: React.FC<BranchOfficesTableProps> = ({ branchOffices }) => {
  const [data, setData] = useState<any>(branchOffices);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBranchOffice, setSelectedBranchOffice] = useState<any | null>(null);

  const handleEdit = (bo: any) => {
    alert(`Editar consultorio: ${bo.nameBranchOffice}`);
  };

  const handleCloseDetails = () => {
    setDetailOpen(false);
    setSelectedBranchOffice(null);
  };

  return (
    <DashboardCard title="Consultorios" subtitle="Gestione sus consultorios">
        <>
        <Box sx={{ p: 2 }}>
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          <Table aria-label="tabla de consultorios" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Nombre
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((bo: any) => (
                <TableRow key={bo.id}>
                  <TableCell>{bo.nameBranchOffice}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(bo)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>

      <Dialog open={detailOpen} onClose={handleCloseDetails} fullWidth maxWidth="sm">
        <DialogTitle>Detalles del Consultorio</DialogTitle>
        <DialogContent dividers>
          {selectedBranchOffice && (
            <Box>
              <Typography variant="subtitle1">
                <strong>Nombre:</strong> {selectedBranchOffice.nameBranchOffice}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Cerrar</Button>
        </DialogActions>
      </Dialog>
        </>
    </DashboardCard>
  );
};

export default BranchOfficesTable;