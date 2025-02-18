import { TableContainer, Table, TableHead, TableRow, TableCell, Typography, TableBody, Button, IconButton } from "@mui/material";
import DashboardCard from "../../components/shared/DashboardCard";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BlockedDatesTableProps } from "../page";

const BlockedDatesTable: React.FC<BlockedDatesTableProps> = ({ blockedDates, onEdit, onDelete }) => {
    return (
        <DashboardCard title="Bloqueo de Fechas" subtitle="Gestione sus horarios no disponibles">
            <TableContainer>
                <Table aria-label="tabla de días bloqueados">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Fecha
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
                                    Es Todo el Día
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
                        {blockedDates.map((bd) => (
                            <TableRow key={bd.id}>
                                <TableCell>{bd.date}</TableCell>
                                <TableCell>{bd.allDay ? '-' : bd.startTime}</TableCell>
                                <TableCell>{bd.allDay ? '-' : bd.endTime}</TableCell>
                                <TableCell>{bd.allDay ? 'Sí' : 'No'}</TableCell>
                                <TableCell>
                                    <IconButton color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </DashboardCard>
    );
};

export default BlockedDatesTable;