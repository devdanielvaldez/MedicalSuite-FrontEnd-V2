'use client';

import React, { useEffect, useState } from 'react';
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
import DashboardCard from '../../components/shared/DashboardCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { httpRequest } from '@/app/utils/http';
import { toast, ToastContainer } from 'react-toastify';
import { dayNumberToString } from '@/app/utils/utils';

export interface WorkDays {
    uuid: string;
    embedding: any;
    userCreatorId: number;
    userUpdatesId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: any;
    availableWorkDaysId: number;
    availableWorkDaysBranchOfficeId: number;
    dayOfWeek: string;
    isActive: boolean;
    branchOffice: BranchOffice;
    workHours: WorkHour[];
}

export interface BranchOffice {
    uuid: string;
    embedding: any;
    userCreatorId: number;
    userUpdatesId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: any;
    branchOfficeId: number;
    branchOfficeContactId: any;
    branchOfficeAddressId: any;
    branchOfficeDoctorId: number;
    availableWorkDaysBranchOfficeId: any;
    nameBranchOffice: string;
    isActive: boolean;
}

export interface WorkHour {
    uuid: string;
    embedding: any;
    userCreatorId: number;
    userUpdatesId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: any;
    workHoursId: number;
    availableWorkDaysId: number;
    startTime: string;
    endTime: string;
    patientLimit: number;
    isActive: boolean;
}

const WorkDaysTable = () => {
    const [data, setData] = useState<WorkDays[] | any>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'delete' | 'toggle' | null>(null);
    const [selectedWorkDay, setSelectedWorkDay] = useState<WorkDays | any>();

    const fetchBranchOffices = async () => {
        try {
            const res: any = await httpRequest({
                url: '/available-work-days/' + localStorage.getItem('selectedBranchOffice'),
                method: 'GET',
                requiresAuth: true
            });

            console.log(res.data);
            setData(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchBranchOffices();
    }, [])

    const handleToggleActive = (wd: WorkDays) => {
        setSelectedWorkDay(wd);
        setConfirmAction('toggle');
        setConfirmOpen(true);
    };

    const handleConfirmClose = () => {
        setConfirmOpen(false);
        setSelectedWorkDay(null);
        setConfirmAction(null);
    };

    const handleConfirmAction = () => {
        httpRequest({
            url: '/available-work-days/' + selectedWorkDay.availableWorkDaysId,
            method: 'DELETE',
            requiresAuth: true
        })
            .then((data: any) => {
                toast.success(data.message);
                fetchBranchOffices();
                handleConfirmClose();
            })
            .catch((err) => {
                toast.error(err.data.message);
            })
    };

    const convertTo12Hour = (time: string): string => {
        const [hoursStr, minutes] = time.split(':');
        let hours = parseInt(hoursStr, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) hours = 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    return (
        <DashboardCard title="Horarios Laborales" subtitle="Gestione sus horarios laborales y filtre">
            <>
                <ToastContainer />
                <Box sx={{ p: 2 }}>
                    <Box sx={{ overflowX: 'auto', width: '100%' }}>
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
                                    <TableCell sx={{ minWidth: 300 }}>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Horarios Laborables
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>

                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((wd: any) => (
                                    <TableRow key={wd.availableWorkDaysId}>
                                        <TableCell>{ dayNumberToString(wd.dayOfWeek) }</TableCell>
                                        <TableCell>{wd.isActive ? "Sí" : "No"}</TableCell>
                                        <TableCell>
                                            <Box display="flex" flexDirection="column" gap={1}>
                                                {wd.workHours.map((wh: any, index: any) => (
                                                    <Box
                                                        key={wh.workHoursId || index}
                                                        sx={{
                                                            backgroundColor: 'grey.100',
                                                            borderRadius: 1,
                                                            p: 1,
                                                            boxShadow: 1,
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                        }}
                                                    >
                                                        <Typography variant="body2">
                                                            {convertTo12Hour(wh.startTime)} - {convertTo12Hour(wh.endTime)}
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            Límite: {wh.patientLimit}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleToggleActive(wd)}>
                                                <CheckCircleIcon color={wd.isActive ? 'success' : 'disabled'} />
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