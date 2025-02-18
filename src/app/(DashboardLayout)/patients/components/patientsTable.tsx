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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardCard from '../../components/shared/DashboardCard';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import BorderAllIcon from '@mui/icons-material/BorderAll';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface Patient {
    id: string;
    name: string;
    age: number;
    phone: string;
    cedula: string;
}

interface PatientsTableProps {
    patients: Patient[];
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

const PatientsTable: React.FC<PatientsTableProps> = ({ patients }) => {
    // Estados para los filtros
    const [filterName, setFilterName] = useState("");
    const [filterCedula, setFilterCedula] = useState("");
    const [filterPhone, setFilterPhone] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

    const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleCloseExport = () => {
        setExportAnchorEl(null);
    };


    // Filtrar pacientes (búsqueda insensible a mayúsculas)
    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(filterName.toLowerCase()) &&
        patient.cedula.toLowerCase().includes(filterCedula.toLowerCase()) &&
        patient.phone.toLowerCase().includes(filterPhone.toLowerCase())
    );

    return (
        <DashboardCard title="Pacientes" subtitle="Gestione sus pacientes y filtre">
            <Box sx={{ p: 2 }}>
                {/* Botón de Filtros */}
                <Box mb={2} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        variant="contained"
                        onClick={() => setShowFilters((prev) => !prev)}
                        startIcon={<FilterListIcon />}
                    >
                        Filtros
                    </Button>

                    <Button variant="contained" startIcon={<DownloadForOfflineIcon />} onClick={handleExportClick}>
                        Exportar
                    </Button>
                    <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={handleCloseExport}>
                        <MenuItem
                            onClick={() => {
                                handleCloseExport();
                            }}
                        >
                            <BorderAllIcon sx={{ mr: 1 }} />
                            Excel
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleCloseExport();
                            }}
                        >
                            <PictureAsPdfIcon sx={{ mr: 1 }} />
                            PDF
                        </MenuItem>
                    </Menu>
                </Box>

                {/* Filtros: se muestran solo si showFilters es true */}
                {showFilters && (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <CustomTextField
                            label="Filtrar por Nombre"
                            variant="outlined"
                            size="small"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                        />
                        <CustomTextField
                            label="Filtrar por Cédula"
                            variant="outlined"
                            size="small"
                            value={filterCedula}
                            onChange={(e) => setFilterCedula(e.target.value)}
                        />
                        <CustomTextField
                            label="Filtrar por Teléfono"
                            variant="outlined"
                            size="small"
                            value={filterPhone}
                            onChange={(e) => setFilterPhone(e.target.value)}
                        />
                    </Box>
                )}

                {/* Tabla de pacientes */}
                <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                    <Table aria-label="tabla de pacientes" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Nombre
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Edad
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Teléfono
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPatients.map((patient) => (
                                <TableRow key={patient.id}>
                                    <TableCell>
                                        <Box display="flex" flexDirection="column">
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {patient.name}
                                            </Typography>
                                            <Typography color="textSecondary" sx={{ fontSize: '13px' }}>
                                                {patient.cedula}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={400}>
                                            {patient.age}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={400}>
                                            {patient.phone}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Box>
        </DashboardCard>
    );
};

export default PatientsTable;