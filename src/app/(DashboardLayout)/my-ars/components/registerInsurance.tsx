'use client';

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
    IconButton,
    Typography,
    Paper,
    Stack,
    Divider,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { httpRequest } from '@/app/utils/http';

export interface Insurance {
    id: string;
    uuid: string;
    name: string;
    isActive: boolean;
    plans: { name: string; description: string, isActive: boolean }[];
}

interface RegisterInsuranceDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (newInsurance: any) => void;
}

const RegisterInsuranceDialog: React.FC<RegisterInsuranceDialogProps> = ({ open, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [plans, setPlans] = useState([{ name: '', description: '' }]);
    const [loading, setLoading] = useState(false);
    const [listARS, setListARS] = useState([]);

    const handlePlanChange = (index: number, value: string) => {
        const updatedPlans = [...plans];
        updatedPlans[index].name = value;
        updatedPlans[index].description = `Este es el plan. ${value}`;
        setPlans(updatedPlans);
    };

    const addPlan = () => {
        setPlans([...plans, { name: '', description: '' }]);
    };

    const removePlan = (index: number) => {
        if (plans.length > 1) {
            setPlans(plans.filter((_, i) => i !== index));
        }
    };

    useEffect(() => {
        const fetchARSCatalogs = () => {
            httpRequest({
                method: 'GET',
                url: '/insurance/insurances-catalog'
            })
                .then((data: any) => {
                    setListARS(data);
                })
        }

        fetchARSCatalogs();
    }, [])

    const handleSave = () => {
        setLoading(true);
        httpRequest({
            method: 'POST',
            url: '/insurance',
            data: {
                insuranceName: name,
                insurancesPlan: plans.map(plan => ({
                    insurancePlanName: plan.name,
                    insurancePlanDescription: plan.description,
                })),
            },
            requiresAuth: true
        })
            .then(async (res: any) => {
                console.log(res);
                onSave(res);
                setName('');
                setPlans([{ name: '', description: '' }]);
                onClose();
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', pb: 1 }}>
                Registrar Seguro
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Stack spacing={3}>

                    <FormControl fullWidth>
                        <InputLabel>Marca del Seguro</InputLabel>
                        <Select
                            label="Seguro"
                            name="seguro"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        >
                            {listARS.map((ins) => (
                                <MenuItem value={ins}>{ins}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="h6" fontWeight="bold">
                        Planes del Seguro
                    </Typography>

                    <Grid container spacing={2}>
                        {plans.map((plan, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Paper
                                    elevation={3}
                                    sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2 }}
                                >
                                    <TextField
                                        label={`Plan ${index + 1}`}
                                        value={plan.name}
                                        onChange={(e) => handlePlanChange(index, e.target.value)}
                                        fullWidth
                                        variant="outlined"
                                    />
                                    {plans.length > 1 && (
                                        <IconButton onClick={() => removePlan(index)} color="error">
                                            <Remove />
                                        </IconButton>
                                    )}
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    <Button
                        onClick={addPlan}
                        startIcon={<Add />}
                        variant="outlined"
                        sx={{ mt: 2, alignSelf: 'center' }}
                    >
                        Agregar otro plan
                    </Button>
                </Stack>
            </DialogContent>

            <Divider sx={{ my: 2 }} />

            <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                <Button onClick={onClose} color="secondary" disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ minWidth: 120 }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RegisterInsuranceDialog;