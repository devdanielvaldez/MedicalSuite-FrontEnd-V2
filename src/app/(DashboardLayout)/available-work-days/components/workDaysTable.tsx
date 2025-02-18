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
    TextField,
    Button,
    Menu,
    MenuItem,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardCard from '../../components/shared/DashboardCard';

import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import BorderAllIcon from '@mui/icons-material/BorderAll';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface WorkDays {
    id: string;
    day: string;
    isActive: string; // "Si" o "No"
    startTime: string;
    endTime: string;
    limit: number;
}

interface WorkDaysTableProps {
    workDays: WorkDays[];
}

const CustomTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: theme.palette.background.paper,
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        '& fieldset': {
            borderColor: theme.palette.divider,
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
        },
    },
}));

const WorkDaysTable: React.FC<WorkDaysTableProps> = ({ workDays }) => {
    // Usamos estado local para almacenar y actualizar los horarios
    const [data, setData] = useState<WorkDays[]>(workDays);

    // Estados para el diálogo de confirmación
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'delete' | 'toggle' | null>(null);
    const [selectedWorkDay, setSelectedWorkDay] = useState<WorkDays | null>(null);

    // Función para editar (aquí simplemente se muestra una alerta)
    const handleEdit = (wd: WorkDays) => {
        alert(`Editar horario para ${wd.day}`);
    };

    // Para eliminar, se abre el diálogo de confirmación
    const handleDelete = (wd: WorkDays) => {
        setSelectedWorkDay(wd);
        setConfirmAction('delete');
        setConfirmOpen(true);
    };

    // Para activar/desactivar, se abre el diálogo de confirmación
    const handleToggleActive = (wd: WorkDays) => {
        setSelectedWorkDay(wd);
        setConfirmAction('toggle');
        setConfirmOpen(true);
    };

    // Cerrar diálogo de confirmación
    const handleConfirmClose = () => {
        setConfirmOpen(false);
        setSelectedWorkDay(null);
        setConfirmAction(null);
    };

    // Ejecuta la acción confirmada (eliminar o cambiar estado)
    const handleConfirmAction = () => {
        if (selectedWorkDay && confirmAction) {
            if (confirmAction === 'delete') {
                setData(data.filter((item) => item.id !== selectedWorkDay.id));
            } else if (confirmAction === 'toggle') {
                setData(
                    data.map((item) => {
                        if (item.id === selectedWorkDay.id) {
                            return {
                                ...item,
                                isActive: item.isActive === 'Si' ? 'No' : 'Si',
                            };
                        }
                        return item;
                    })
                );
            }
        }
        handleConfirmClose();
    };

    return (
        <DashboardCard title="Horarios Laborales" subtitle="Gestione sus horarios laborales y filtre">
            <>
                <Box sx={{ p: 2 }}>
                    <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                        <Table aria-label="tabla de horarios laborales" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Día
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Activo
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Hora Inicio
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Hora Final
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Límite de Pacientes
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
                                {data.map((wd) => (
                                    <TableRow key={wd.id}>
                                        <TableCell>{wd.day}</TableCell>
                                        <TableCell>{wd.isActive}</TableCell>
                                        <TableCell>{wd.startTime}</TableCell>
                                        <TableCell>{wd.endTime}</TableCell>
                                        <TableCell>{wd.limit}</TableCell>
                                        <TableCell>
                                            <IconButton color="primary" onClick={() => handleEdit(wd)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(wd)}>
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleToggleActive(wd)}>
                                                <CheckCircleIcon color={wd.isActive === 'Si' ? 'success' : 'disabled'} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>

                <Dialog open={confirmOpen} onClose={handleConfirmClose}>
                    <DialogTitle>
                        {confirmAction === 'delete'
                            ? 'Confirmar Eliminación'
                            : 'Confirmar Cambio de Estado'}
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            {confirmAction === 'delete'
                                ? '¿Está seguro de que desea eliminar este horario laboral?'
                                : '¿Está seguro de que desea cambiar el estado de activación de este horario laboral?'}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleConfirmClose}>Cancelar</Button>
                        <Button variant="contained" onClick={handleConfirmAction}>
                            Confirmar
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        </DashboardCard>
    );
};

export default WorkDaysTable;