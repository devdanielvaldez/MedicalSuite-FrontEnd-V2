'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Fab,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RegisterInsuranceDialog, { Insurance } from './components/registerInsurance';
import InsuranceCard from './components/insuranceCard';
import { httpRequest } from '@/app/utils/http';
import { toast, ToastContainer } from 'react-toastify';

const InsuranceList: React.FC = () => {
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [insuranceToDelete, setInsuranceToDelete] = useState<Insurance | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  const fetchInsurances = async () => {
    try {
      const response: any = await httpRequest({
        method: 'GET',
        url: '/insurance/insurances',
        requiresAuth: true
      });

      if (response) {
        const formattedInsurances = response.map((item: any) => ({
          id: item.insuranceId,
          uuid: item.uuid,
          name: item.insuranceName,
          isActive: item.isActive,
          plans: item.insurancePlan.map((plan: any) => ({
            id: plan.insurancePlanId,
            uuid: plan.uuid,
            name: plan.insurancePlanName,
            isActive: plan.isActive,
            description: plan.insurancePlanDescription
          }))
        }));

        setInsurances(formattedInsurances);
      }
    } catch (error) {
      console.error('Error fetching insurances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurances();
  }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleSaveInsurance = (newInsurance: Insurance) => {
    setInsurances([...insurances, newInsurance]);
  };

  const handleDeleteActiveConfirm = (insurance: Insurance) => {
    setInsuranceToDelete(insurance);
    if (!insuranceToDelete) return;

    setDeleteLoading(true);

    httpRequest({
      method: 'DELETE',
      url: `/insurance/insurance-by-id?insuranceId=${insurance.id}&uuid=${insurance.uuid}`,
      requiresAuth: true
    })
      .then(() => {
        toast.success(`Seguro ${insurance.isActive == true ? 'Descativado' : 'Activado'} correctamente`);
        fetchInsurances();
      })
      .catch((err) => {
        toast.error("Ha ocurrido un error, por favor intentelo otra vez");
        console.error('Error al eliminar:', err);
      })
      .finally(() => {
        setDeleteLoading(false);
        setInsuranceToDelete(null);
      });
  };

  const handleCancelDelete = () => {
    setInsuranceToDelete(null);
  };

  const handleCredentials = (insurance: Insurance) => {
    alert(`Credenciales de: ${insurance.name}`);
  };

  const handleDeletePlan = (plan: any): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        setIsLoadingPlan(true);
        await httpRequest({
          method: 'DELETE',
          url: `/insurance/insurance-plan-by-id?insurancePlanId=${plan.id}&uuid=${plan.uuid}`,
          requiresAuth: true
        });
        await fetchInsurances();
        toast.success(`Plan ${plan.isActive == true ? 'Desactivado' : 'Activado'} correctamente`);
        resolve();
      } catch (err) {
        toast.error("Ha ocurrido un error, por favor intentelo otra vez");
        console.error('Error al eliminar plan:', err);
        reject(err);
      }
      finally {
        setIsLoadingPlan(false);
      }
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {insurances.length === 0 ? (
            <Typography variant="h6" textAlign="center" sx={{ mt: 3 }}>
              No hay seguros registrados.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {insurances.map((insurance) => (
                <Grid item xs={12} sm={6} md={4} key={insurance.id}>
                  <InsuranceCard
                    insurance={insurance}
                    onDeleteActive={(e) => handleDeleteActiveConfirm(e)}
                    onCredentials={handleCredentials}
                    onDeletePlan={(plan) => handleDeletePlan(plan)}
                    isLoading={isLoadingPlan}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <RegisterInsuranceDialog open={openDialog} onClose={handleCloseDialog} onSave={handleSaveInsurance} />

      <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <Tooltip title="Registrar Seguro">
          <Fab color="primary" onClick={handleOpenDialog}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>

      <Dialog open={Boolean(insuranceToDelete)} onClose={handleCancelDelete} fullWidth maxWidth="xs">
        <DialogTitle>Confirmación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres {insuranceToDelete?.isActive ? 'Desactivar' : 'Activar'} el seguro <b>{insuranceToDelete?.name}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="secondary" disabled={deleteLoading}>
            Cancelar
          </Button>
          <Button onClick={() => insuranceToDelete && handleDeleteActiveConfirm(insuranceToDelete)} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={24} color="inherit" /> : insuranceToDelete?.isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InsuranceList;