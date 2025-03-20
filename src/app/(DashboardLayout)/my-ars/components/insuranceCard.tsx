'use client';

import React, { useState } from 'react';
import {
    Card,
    CardActions,
    Typography,
    IconButton,
    Paper,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Fade,
    Tooltip,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import ListIcon from '@mui/icons-material/List';
import { Insurance } from './registerInsurance';
import { CheckCircleOutlineOutlined } from '@mui/icons-material';

interface InsuranceCardProps {
    insurance: Insurance;
    onDeleteActive: (insurance: Insurance) => void;
    onCredentials: (insurance: Insurance) => void;
    onDeletePlan: (plan: any) => Promise<void>;
    isLoading: boolean;
}

const InsuranceCard: React.FC<InsuranceCardProps> = ({ insurance, onDeleteActive, onCredentials, onDeletePlan, isLoading }) => {
    const [openPlansDialog, setOpenPlansDialog] = useState(false);

    return (
        <>
            <Fade in={true} timeout={500}>
                <Card
                    sx={{
                        minWidth: 320,
                        borderRadius: 4,
                        boxShadow: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 2,
                        position: 'relative',
                    }}
                >
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                        {insurance.name}
                    </Typography>

                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                        {insurance.isActive ? (
                            <Tooltip title="Desactivar Seguro">
                                <IconButton onClick={() => onDeleteActive(insurance)} color="error">
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Activar Seguro">
                                <IconButton onClick={() => onDeleteActive(insurance)} color="success">
                                    <CheckCircleOutlineOutlined fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {/* <Tooltip title="Credenciales OFV">
                            <IconButton onClick={() => onCredentials(insurance)} color="info">
                                <LockIcon fontSize="small" />
                            </IconButton>
                        </Tooltip> */}
                        <Tooltip title="Planes">
                            <IconButton onClick={() => setOpenPlansDialog(true)} color="info">
                                <ListIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </CardActions>
                </Card>
            </Fade>

            <Dialog open={openPlansDialog} onClose={() => setOpenPlansDialog(false)} fullWidth maxWidth="md">
                <DialogTitle>Planes de {insurance.name}</DialogTitle>
                <DialogContent>
                    {insurance?.plans?.length > 0 ? (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {insurance?.plans?.map((plan, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Paper
                                        elevation={3}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Typography variant="body1" fontWeight={600} color="primary.dark">
                                            {plan.name}
                                        </Typography>
                                        {isLoading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            plan.isActive ? (
                                                <Tooltip title="Desactivar Plan">
                                                    <IconButton
                                                        onClick={() =>
                                                            onDeletePlan(plan)
                                                                .then(() => setOpenPlansDialog(false))
                                                                .catch((err) => console.error(err))
                                                        }
                                                        color="error"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="Activar Plan">
                                                    <IconButton
                                                        onClick={() =>
                                                            onDeletePlan(plan)
                                                                .then(() => setOpenPlansDialog(false))
                                                                .catch((err) => console.error(err))
                                                        }
                                                        color="success"
                                                    >
                                                        <CheckCircleOutlineOutlined fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )
                                        )}

                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            No hay planes disponibles.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPlansDialog(false)} color="primary" variant="contained">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default InsuranceCard;