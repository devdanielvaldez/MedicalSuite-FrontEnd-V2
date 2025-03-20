'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Fab,
  CircularProgress,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import { httpRequest } from '@/app/utils/http';
import { toast, ToastContainer } from 'react-toastify';
import PageContainer from '../components/container/PageContainer';

export interface Service {
  id: string;
  name: string;
  price: number;
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchServices = async () => {
    try {
      const response: any = await httpRequest({
        method: 'GET',
        url: '/doctor-services',
        requiresAuth: true
      });
      if (response) {
        setServices(response);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (service: Service) => {
    try {
      await httpRequest({
        method: 'DELETE',
        url: `/services/${service.id}`,
        requiresAuth: true
      });
      toast.success("Servicio eliminado exitosamente");
      fetchServices();
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      toast.error("Error al eliminar el servicio");
    }
  };

  const handleEdit = (service: Service) => {
    toast.info(`Editar servicio: ${service.name}`);
  };

  const handleStatistics = (service: Service) => {
    toast.info(`Estadísticas para: ${service.name}`);
  };

  return (
    <PageContainer title="Servicios" description="Servicios del consultorio">
      <ToastContainer />
      <Box sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {services.length === 0 ? (
              <Typography variant="h6" textAlign="center" sx={{ mt: 3 }}>
                No existen servicios registrados, <br /> para ingresar un nuevo servicio haga click en +
              </Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table aria-label="tabla de servicios" sx={{ mt: 2 }}>
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
                            <IconButton onClick={() => handleEdit(service)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton onClick={() => handleDelete(service)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Estadísticas">
                            <IconButton onClick={() => handleStatistics(service)} color="info">
                              <BarChartIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </>
        )}
      </Box>

      <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <Tooltip title="Registrar Servicio">
          <Fab color="primary">
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>
    </PageContainer>
  );
};

export default ServicesPage;