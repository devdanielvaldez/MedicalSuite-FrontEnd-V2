'use client';

import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
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

    CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardCard from '../../components/shared/DashboardCard';

import FilterListIcon from '@mui/icons-material/FilterList';

import { httpRequest } from '@/app/utils/http';
import debounce from 'lodash/debounce';

export interface Patient {
    uuid: string;
    patientId: number;
    person: {
        firstName: string;
        lastName: string;
        identityCard: string;
        birthday: string;
        contact: {
            phoneNumbers: Array<{
                phoneNumber: string;
            }>;
        };
    };
}

interface TransformedPatient {
    id: string;
    name: string;
    age: number;
    phone: string;
    cedula: string;
}

interface SearchFilters {
    name?: string;
    identityCard?: string;
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

export interface PatientsTableMethods {
    refreshData: () => void;
  }

const PatientsTable = forwardRef<PatientsTableMethods, any>((props, ref) => {
    const [patients, setPatients] = useState<TransformedPatient[]>([]);
    const [filterName, setFilterName] = useState("");
    const [filterCedula, setFilterCedula] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

    const calculateAge = (birthday: string): number => {
        const birthdayDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthdayDate.getFullYear();
        const monthDiff = today.getMonth() - birthdayDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdayDate.getDate())) {
            age--;
        }
        
        return age;
    };

    useImperativeHandle(ref, () => ({
        refreshData: () => {
          console.log("Actualizando tabla de pacientes...");
          fetchPatients();
        }
      }));

    const formatPhoneNumber = (phoneNumber: string): string => {
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        if (cleaned.length < 10) return phoneNumber;
        
        return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)} - ${cleaned.substring(6, 10)}`;
    };

    const formatIdentityCard = (identityCard: string): string => {
        const cleaned = identityCard.replace(/\D/g, '');
        
        if (cleaned.length !== 11) return identityCard;
        
        return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 10)}-${cleaned.substring(10, 11)}`;
    };

    const buildQueryUrl = (baseUrl: string, filters: SearchFilters): string => {
        const params = new URLSearchParams();
        
        if (filters.name) params.append('name', filters.name);
        if (filters.identityCard) params.append('identityCard', filters.identityCard);
        
        const queryString = params.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    };

    const fetchPatients = useCallback(async () => {
        setIsLoading(true);
        try {
            const branchOfficeId = localStorage.getItem("selectedBranchOffice");
            const baseUrl = `/patient/${branchOfficeId}`;
            const url = buildQueryUrl(baseUrl, searchFilters);
            
            const res: any = await httpRequest({
                url,
                method: 'GET',
                requiresAuth: true
            });

            const transformedPatients: TransformedPatient[] = res.map((patient: Patient) => ({
                id: patient.uuid,
                name: `${patient.person.firstName} ${patient.person.lastName}`,
                age: calculateAge(patient.person.birthday),
                phone: patient.person.contact?.phoneNumbers?.[0]?.phoneNumber || '',
                cedula: patient.person.identityCard
            }));

            setPatients(transformedPatients);
        } catch(err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, [searchFilters]);

    const debouncedFetchPatients = useCallback(
        debounce(() => {
            fetchPatients();
        }, 300),
        [fetchPatients]
    );

    useEffect(() => {
        debouncedFetchPatients();

        return () => {
            debouncedFetchPatients.cancel();
        };
    }, [searchFilters, debouncedFetchPatients]);

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilterName(value);

        setSearchFilters(prev => {
            const newFilters = { ...prev };
            if (value) {
                newFilters.name = value;
            } else {
                delete newFilters.name;
            }
            return newFilters;
        });
    };

    const handleCedulaFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilterCedula(value);

        setSearchFilters(prev => {
            const newFilters = { ...prev };
            if (value) {
                newFilters.identityCard = value;
            } else {
                delete newFilters.identityCard;
            }
            return newFilters;
        });
    };

    return (
        <DashboardCard title="Pacientes" subtitle="Gestione sus pacientes y filtre">
            <Box sx={{ p: 2 }}>
                <Box mb={2} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        variant="contained"
                        onClick={() => setShowFilters((prev) => !prev)}
                        startIcon={<FilterListIcon />}
                    >
                        Filtros
                    </Button>
                </Box>

                {showFilters && (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <CustomTextField
                            label="Filtrar por Nombre"
                            variant="outlined"
                            size="small"
                            value={filterName}
                            onChange={handleNameFilterChange}
                        />
                        <CustomTextField
                            label="Filtrar por Cédula"
                            variant="outlined"
                            size="small"
                            value={filterCedula}
                            onChange={handleCedulaFilterChange}
                        />
                    </Box>
                )}

                <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
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
                                {patients.length > 0 ? (
                                    patients.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell>
                                                <Box display="flex" flexDirection="column">
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {patient.name}
                                                    </Typography>
                                                    <Typography color="textSecondary" sx={{ fontSize: '13px' }}>
                                                        {formatIdentityCard(patient.cedula)}
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
                                                    {formatPhoneNumber(patient.phone)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            <Typography variant="body2">
                                                No se encontraron pacientes con los criterios de búsqueda.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </Box>
            </Box>
        </DashboardCard>
    );
});

export default PatientsTable;