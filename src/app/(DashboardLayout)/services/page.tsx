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
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { httpRequest } from '@/app/utils/http';
import { toast, ToastContainer } from 'react-toastify';
import PageContainer from '../components/container/PageContainer';

interface Branch {
  nameBranchOffice: string;
}

interface BranchMapping {
  id: number;
  price: string;
  branch: Branch;
  branchId: number;
}

export interface Service {
  id: string;
  name: string;
  price?: number;
  branchMappings: BranchMapping[];
}

interface BranchOffice {
  branchOfficeId: number;
  nameBranchOffice: string;
}

interface BranchPrice {
  branchId: number;
  price: number;
  isActive: boolean;
}

interface NewServiceForm {
  name: string;
  description: string;
  branches: BranchPrice[];
}

interface NewBranch {
  branchId: number | string;
  price: number;
  isActive: boolean;
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openPriceModal, setOpenPriceModal] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Estados para el modal de creación
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [branches, setBranches] = useState<BranchOffice[]>([]);
  const [newService, setNewService] = useState<NewServiceForm>({
    name: '',
    description: '',
    branches: []
  });
  const [loadingBranches, setLoadingBranches] = useState<boolean>(false);

  // Estados para el modal de edición
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [availableBranches, setAvailableBranches] = useState<BranchOffice[]>([]);
  const [newBranch, setNewBranch] = useState<NewBranch>({
    branchId: '',
    price: 0,
    isActive: true
  });

  const fetchServices = async () => {
    try {
      const response: any = await httpRequest({
        method: 'GET',
        url: '/doctor-services/doctor/' + localStorage.getItem('doctorId'),
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

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const response: any = await httpRequest({
        method: 'GET',
        url: '/branch-office/get-all-by-doctor',
        requiresAuth: true
      });
      
      if (response) {
        setBranches(response);
        
        // Inicializar precios para cada sucursal
        const initialBranches = response.map((branch: any) => ({
          branchId: branch.branchOfficeId,
          price: 0,
          isActive: true
        }));
        
        setNewService(prev => ({
          ...prev,
          branches: initialBranches
        }));
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Error al obtener sucursales");
    } finally {
      setLoadingBranches(false);
    }
  };

  // Función para cargar las sucursales disponibles para edición
  const fetchAvailableBranchesForEdit = async (service: Service) => {
    setLoadingBranches(true);
    try {
      const allBranches: any = await httpRequest({
        method: 'GET',
        url: '/branch-office/get-all-by-doctor',
        requiresAuth: true
      });
      
      if (allBranches) {
        // Filtrar sucursales que no están vinculadas al servicio
        const linkedBranchIds = service.branchMappings.map(mapping => mapping.branchId);
        const availableBranchesForLinking = allBranches.filter(
          (branch: any) => !linkedBranchIds.includes(branch.branchOfficeId)
        );
        
        setAvailableBranches(availableBranchesForLinking);
      }
    } catch (error) {
      console.error("Error fetching branches for edit:", error);
      toast.error("Error al obtener sucursales disponibles");
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Modal de Crear Servicio
  const handleOpenCreateModal = () => {
    setOpenCreateModal(true);
    fetchBranches();
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setNewService({
      name: '',
      description: '',
      branches: []
    });
  };

  // Modal de Editar Servicio
  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setOpenEditModal(true);
    fetchAvailableBranchesForEdit(service);
    setNewBranch({
      branchId: '',
      price: 0,
      isActive: true
    });
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingService(null);
    setAvailableBranches([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (branchId: number, price: string) => {
    const numericPrice = price === '' ? 0 : parseFloat(price);
    
    setNewService(prev => ({
      ...prev,
      branches: prev.branches.map(branch => 
        branch.branchId === branchId ? { ...branch, price: numericPrice } : branch
      )
    }));
  };

  const handleActiveChange = (branchId: number, isActive: boolean) => {
    setNewService(prev => ({
      ...prev,
      branches: prev.branches.map(branch => 
        branch.branchId === branchId ? { ...branch, isActive } : branch
      )
    }));
  };

  // Manejadores para el nuevo branch en edición
  const handleNewBranchChange = (e: any) => {
    const { name, value } = e.target;
    if (name) {
      setNewBranch(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNewBranchPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericPrice = value === '' ? 0 : parseFloat(value);
    setNewBranch(prev => ({
      ...prev,
      price: numericPrice
    }));
  };

  // Obtener solo las sucursales activas
  const getActiveBranches = () => {
    return newService.branches.filter(branch => branch.isActive);
  };

  // Agregar nueva sucursal al servicio
  const handleAddBranchToService = async () => {
    if (!editingService || newBranch.branchId === '') {
      toast.error("Seleccione una sucursal");
      return;
    }

    try {
      const payload = {
        branchId: Number(newBranch.branchId),
        price: newBranch.price,
        isActive: newBranch.isActive
      };

      await httpRequest({
        method: 'POST',
        url: `/doctor-services/${editingService.id}/branch`,
        data: payload,
        requiresAuth: true
      });

      toast.success("Sucursal vinculada exitosamente");
      
      // Actualizar la lista de servicios
      fetchServices();
      
      // Actualizar la lista de sucursales disponibles
      if (editingService) {
        fetchAvailableBranchesForEdit(editingService);
      }
      
      // Limpiar el formulario de nueva sucursal
      setNewBranch({
        branchId: '',
        price: 0,
        isActive: true
      });
    } catch (error) {
      console.error("Error al vincular sucursal:", error);
      toast.error("Error al vincular la sucursal");
    }
  };

  const handleCreateService = async () => {
    if (!newService.name.trim()) {
      toast.error("El nombre del servicio es requerido");
      return;
    }

    const activeBranches = getActiveBranches();
    if (activeBranches.length === 0) {
      toast.error("Debe activar al menos una sucursal");
      return;
    }

    try {
      const doctorId = localStorage.getItem('doctorId');
      const payload = {
        name: newService.name,
        description: newService.description,
        doctorId: Number(doctorId),
        branches: activeBranches // Solo enviar sucursales activas
      };

      await httpRequest({
        method: 'POST',
        url: '/doctor-services',
        data: payload,
        requiresAuth: true
      });

      toast.success("Servicio creado exitosamente");
      handleCloseCreateModal();
      fetchServices();
    } catch (error) {
      console.error("Error creando servicio:", error);
      toast.error("Error al crear el servicio");
    }
  };

  const handleDelete = async (service: Service) => {
    try {
      await httpRequest({
        method: 'DELETE',
        url: `/doctor-services/${service.id}`,
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
    handleOpenEditModal(service);
  };

  const handleStatistics = (service: Service) => {
    toast.info(`Estadísticas para: ${service.name}`);
  };

  const handleOpenPriceModal = (service: Service) => {
    setSelectedService(service);
    setOpenPriceModal(true);
  };

  const handleClosePriceModal = () => {
    setOpenPriceModal(false);
    setSelectedService(null);
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
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title="Ver precios por sucursal">
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => handleOpenPriceModal(service)}
                              >
                                <StorefrontIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
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

      {/* Modal para mostrar precios por sucursal */}
      <Dialog open={openPriceModal} onClose={handleClosePriceModal}>
        <DialogTitle>
          Precios de {selectedService?.name} por Sucursal
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedService?.branchMappings.map((mapping) => (
              <ListItem key={mapping.id} divider>
                <ListItemText 
                  primary={mapping.branch.nameBranchOffice} 
                  secondary={`Precio: $${parseFloat(mapping.price).toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePriceModal} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para crear servicio */}
      <Dialog 
        open={openCreateModal} 
        onClose={handleCloseCreateModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Registrar Nuevo Servicio
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nombre del Servicio"
                value={newService.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Descripción"
                value={newService.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Precios por Sucursal
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {loadingBranches ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                branches.length === 0 ? (
                  <Typography color="textSecondary">
                    No hay sucursales disponibles.
                  </Typography>
                ) : (
                  <>
                    {getActiveBranches().length === 0 && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Debe activar al menos una sucursal para registrar el servicio.
                      </Alert>
                    )}
                    <Grid container spacing={2}>
                      {branches.map((branch) => {
                        const branchPrice = newService.branches.find(
                          b => b.branchId === branch.branchOfficeId
                        );
                        
                        return (
                          <Grid item xs={12} sm={6} key={branch.branchOfficeId}>
                            <Box 
                              sx={{ 
                                p: 2, 
                                border: '1px solid', 
                                borderColor: branchPrice?.isActive ? 'primary.main' : 'divider',
                                borderRadius: 1,
                                height: '100%',
                                opacity: branchPrice?.isActive ? 1 : 0.7
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight={500}>
                                {branch.nameBranchOffice}
                              </Typography>
                              
                              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <TextField
                                  label="Precio"
                                  type="number"
                                  value={branchPrice?.price || 0}
                                  onChange={(e) => handlePriceChange(branch.branchOfficeId, e.target.value)}
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                  }}
                                  disabled={!branchPrice?.isActive}
                                  size="small"
                                />
                                
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={branchPrice?.isActive || false}
                                      onChange={(e) => handleActiveChange(branch.branchOfficeId, e.target.checked)}
                                      color="primary"
                                    />
                                  }
                                  label="Activo"
                                  labelPlacement="start"
                                />
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </>
                )
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateModal}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateService} 
            variant="contained" 
            color="primary"
            disabled={!newService.name.trim() || loadingBranches || getActiveBranches().length === 0}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para editar servicio y agregar sucursales */}
      <Dialog 
        open={openEditModal} 
        onClose={handleCloseEditModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Editar Servicio: {editingService?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Sucursales Vinculadas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {editingService?.branchMappings.length === 0 ? (
                <Typography color="textSecondary">
                  No hay sucursales vinculadas a este servicio.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {editingService?.branchMappings.map((mapping) => (
                    <Grid item xs={12} sm={6} key={mapping.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {mapping.branch.nameBranchOffice}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Precio: ${parseFloat(mapping.price).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Agregar Nueva Sucursal
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {loadingBranches ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : availableBranches.length === 0 ? (
                <Alert severity="info">
                  Todas las sucursales ya están vinculadas a este servicio.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Seleccionar Sucursal</InputLabel>
                      <Select
                        name="branchId"
                        value={newBranch.branchId}
                        onChange={handleNewBranchChange}
                        label="Seleccionar Sucursal"
                      >
                        <MenuItem value="">
                          <em>Seleccionar</em>
                        </MenuItem>
                        {availableBranches.map((branch) => (
                          <MenuItem key={branch.branchOfficeId} value={branch.branchOfficeId}>
                            {branch.nameBranchOffice}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Precio"
                      type="number"
                      value={newBranch.price}
                      onChange={handleNewBranchPriceChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="contained" 
                        onClick={handleAddBranchToService}
                        disabled={!newBranch.branchId}
                      >
                        Agregar Sucursal
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <Tooltip title="Registrar Servicio">
          <Fab color="primary" onClick={handleOpenCreateModal}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>
    </PageContainer>
  );
};

export default ServicesPage;