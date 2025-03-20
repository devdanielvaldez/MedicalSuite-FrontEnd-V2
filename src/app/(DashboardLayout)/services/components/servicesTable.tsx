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
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart'; // icono para estadísticas
import DashboardCard from '../../components/shared/DashboardCard';

export interface Service {
  id: string;
  name: string;
  price: number;
}

interface ServicesTableProps {
  services: Service[];
  onDelete: (service: Service) => void;
  onEdit: (service: Service) => void;
  onStatistics: (service: Service) => void;
}

const ServicesTable: React.FC<ServicesTableProps> = ({
  services,
  onDelete,
  onEdit,
  onStatistics
}) => {
  return (
    <DashboardCard title="Servicios" subtitle="Gestione sus servicios">
      <Box sx={{ p: 2, overflowX: 'auto' }}>
        <Table aria-label="tabla de servicios" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Nombre del Servicio
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Precio
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={600}>
                  Acciones
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {service.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    ${service.price.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => onEdit(service)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton onClick={() => onDelete(service)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Estadísticas">
                    <IconButton onClick={() => onStatistics(service)} color="info">
                      <BarChartIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </DashboardCard>
  );
};

export default ServicesTable;