'use client';

import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import DashboardCard from '../../components/shared/DashboardCard';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';

export interface BranchOffice {
  uuid: string;
  branchOfficeId: number;
  branchOfficeDoctorId: number | null;
  nameBranchOffice: string;
  phoneNumber?: string;
}

interface BranchOfficesTableProps {
  branchOffices: BranchOffice[];
  loading: boolean;
  onEdit: (bo: BranchOffice) => void;
  onShowDetails: (bo: BranchOffice) => void;
}

const BranchOfficesTable: React.FC<BranchOfficesTableProps> = ({
  branchOffices,
  loading,
  onEdit,
  onShowDetails
}) => {
  return (
    <DashboardCard title="Consultorios" subtitle="Gestione sus consultorios">
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto', width: { xs: '280px', sm: 'auto' } }}>
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
                {branchOffices.map((bo) => (
                  <TableRow key={bo.branchOfficeId}>
                    <TableCell>{bo.nameBranchOffice}</TableCell>
                    <TableCell>
                      <Tooltip title="Editar Consultorio">
                        <IconButton color="success" onClick={() => onEdit(bo)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Detalles">
                        <IconButton color="secondary" onClick={() => onShowDetails(bo)}>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    </DashboardCard>
  );
};

export default BranchOfficesTable;