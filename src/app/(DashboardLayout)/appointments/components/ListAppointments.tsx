'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Collapse,
  TextField,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide,
  SlideProps,
  DialogActions,
  Tooltip,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';

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

import { es } from 'date-fns/locale';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';


// -----------------------------------------------------------------------------
// Datos de ejemplo
// -----------------------------------------------------------------------------
const patients = [
  {
    id: "1",
    firstName: "Daniel",
    lastName: "Valdez",
    phone: "+1 (809) 000 - 1111",
    date: "10/10/2025",
    hour: "09:00 AM",
    status: "PE",
    insurance: "HUMANO",
  },
];

const samplePatients = [
  { id: '1', name: 'Daniel Valdez' },
  { id: '2', name: 'Ana Martínez' },
  { id: '3', name: 'Luis Pérez' },
];

// -----------------------------------------------------------------------------
// Styled Component
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// Transición personalizada para los modales
// -----------------------------------------------------------------------------
const Transition = React.forwardRef<unknown, SlideProps>(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// -----------------------------------------------------------------------------
// Modal de confirmación para eliminar la cita
// -----------------------------------------------------------------------------
const DeleteConfirmationModal = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { p: 3, borderRadius: 2, boxShadow: 3 },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
        Confirmar Eliminación
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
          ¿Está seguro de que desea eliminar la cita?
        </Box>
        <Box display="flex" justifyContent="space-between" gap={2}>
          <Button variant="outlined" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" fullWidth onClick={onConfirm}>
            Eliminar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// -----------------------------------------------------------------------------
// Modal para autorizar seguros
// -----------------------------------------------------------------------------
interface AuthorizeInsuranceModalProps {
  open: boolean;
  onClose: () => void;
  onAuthorize: () => void;
  loading: boolean;
  message: string;
  policyNumber: string;
  setPolicyNumber: React.Dispatch<React.SetStateAction<string>>;
}

const AuthorizeInsuranceModal: React.FC<AuthorizeInsuranceModalProps> = ({
  open,
  onClose,
  onAuthorize,
  loading,
  message,
  policyNumber,
  setPolicyNumber,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
          background: 'linear-gradient(135deg, #ffffff, #f7f7f7)',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
        Autorizar Seguro
        {!loading && (
          <IconButton
            aria-label="cerrar"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.600' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Seguro:
          </Typography>
          <Typography variant="body1">Humano</Typography>
        </Box>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Plan:
          </Typography>
          <Typography variant="body1">Royal</Typography>
        </Box>
        <CustomTextField
          label="Número de Póliza"
          variant="outlined"
          fullWidth
          value={policyNumber}
          onChange={(e) => setPolicyNumber(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onAuthorize}
          disabled={loading || policyNumber.trim() === ""}
        >
          {loading ? message : "Autorizar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// -----------------------------------------------------------------------------
// Modal de éxito de autorización de seguros
// -----------------------------------------------------------------------------
interface AuthorizeInsuranceSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onRevert: () => void;
  onContinue: () => void;
  authorizationNumber: string;
}

const AuthorizeInsuranceSuccessModal: React.FC<AuthorizeInsuranceSuccessModalProps> = ({
  open,
  onClose,
  onRevert,
  onContinue,
  authorizationNumber,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { p: 3, borderRadius: 2, boxShadow: 3, textAlign: 'center' },
      }}
    >
      <DialogTitle>
        <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6">Autorización completada</Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Número de Autorización: {authorizationNumber}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button variant="outlined" color="error" onClick={onRevert}>
          Revertir
        </Button>
        <Button variant="contained" color="primary" onClick={onContinue}>
          Continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// -----------------------------------------------------------------------------
// Modal para confirmar reversión de autorización
// -----------------------------------------------------------------------------
const RevertConfirmationModal = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { p: 3, borderRadius: 2, boxShadow: 3 },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
        Confirmar Reversión
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
          ¿Está seguro de que desea revertir la autorización?
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button variant="outlined" color="error" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// -----------------------------------------------------------------------------
// Modal para reagendar cita (nueva opción)
// -----------------------------------------------------------------------------
const RescheduleModal = ({
  open,
  onClose,
  onReschedule,
}: {
  open: boolean;
  onClose: () => void;
  onReschedule: (newDate: Date | null, newTime: Date | null) => void;
}) => {
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState<Date | null>(null);

  const handleSubmit = () => {
    onReschedule(newDate, newTime);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { p: 3, borderRadius: 2, boxShadow: 3, background: 'linear-gradient(135deg, #fff, #f7f7f7)' },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
        Reagendar Cita
        <IconButton
          aria-label="cerrar"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.600' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box
            sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <DatePicker
              label="Nueva Fecha"
              value={newDate}
              onChange={(newValue) => setNewDate(newValue)}
              minDate={new Date()}
              slots={{ textField: TextField }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                },
              }}
            />
            <TimePicker
              label="Nueva Hora"
              value={newTime}
              onChange={(newValue) => setNewTime(newValue)}
              ampm={false}
              slots={{ textField: TextField }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                },
              }}
            />
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} variant="contained" fullWidth>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};


const ListAppointments = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const theme = useTheme();

  // Estados para autorización de seguros
  const [isAuthorizeModalOpen, setIsAuthorizeModalOpen] = useState(false);
  const [isAuthorizeLoading, setIsAuthorizeLoading] = useState(false);
  const [authorizeMessage, setAuthorizeMessage] = useState("");
  const [isAuthorizeSuccessModalOpen, setIsAuthorizeSuccessModalOpen] = useState(false);
  const [policyNumber, setPolicyNumber] = useState("");
  const [authorizationNumber, setAuthorizationNumber] = useState("");
  const [isRevertConfirmOpen, setIsRevertConfirmOpen] = useState(false);

  // Estado para reagendar
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  const handleToggleFilter = () => {
    setFilterOpen((prev) => !prev);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExport = () => {
    setExportAnchorEl(null);
  };

  // Funciones para el modal de eliminación
  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    console.log('Cita eliminada');
    setIsDeleteModalOpen(false);
  };

  // Handler para acceder a la historia clínica
  const handleHistoryAccess = () => {
    console.log('Acceder a la historia clínica');
  };

  // Handler para abrir modal de autorización de seguros
  const handleAuthorizeInsurance = () => {
    setIsAuthorizeModalOpen(true);
  };

  // Handler que se ejecuta al presionar "Autorizar" en el modal
  const handleAuthorizeSubmit = () => {
    setIsAuthorizeLoading(true);
    setAuthorizeMessage("Autorizando...");
    setTimeout(() => {
      setAuthorizeMessage("Espere un momento...");
      setTimeout(() => {
        setAuthorizeMessage("Casi terminamos...");
        setTimeout(() => {
          setIsAuthorizeLoading(false);
          setIsAuthorizeModalOpen(false);
          const randomAuth = Math.floor(Math.random() * 1000000).toString();
          setAuthorizationNumber(randomAuth);
          setIsAuthorizeSuccessModalOpen(true);
          setPolicyNumber("");
          setAuthorizeMessage("");
        }, 2000);
      }, 2000);
    }, 2000);
  };

  // Handler para abrir modal de confirmación de reversión
  const handleOpenRevertConfirm = () => {
    setIsRevertConfirmOpen(true);
  };

  const handleCloseRevertConfirm = () => {
    setIsRevertConfirmOpen(false);
  };

  const handleConfirmRevert = () => {
    console.log("Reversión confirmada");
    setIsRevertConfirmOpen(false);
    setIsAuthorizeSuccessModalOpen(false);
  };

  const handleSuccessContinue = () => {
    console.log("Continuar acción");
    setIsAuthorizeSuccessModalOpen(false);
  };

  // Handlers para el modal de reagendar
  const handleOpenRescheduleModal = () => {
    setIsRescheduleModalOpen(true);
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
  };

  const handleReschedule = (newDate: Date | null, newTime: Date | null) => {
    console.log("Reagendado a:", newDate, newTime);
    // Aquí puedes actualizar la cita con la nueva fecha y hora
  };

  return (
    <DashboardCard title="Gestión de citas" subtitle="Visualiza y controla tus citas">
      <>
        <Box mb={2} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="contained" startIcon={<FilterListIcon />} onClick={handleToggleFilter}>
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

        <Collapse in={filterOpen}>
          <Box mb={2} display="flex" gap={2} flexWrap="wrap">
            <CustomTextField label="Nombre" variant="outlined" size="small" />
            <CustomTextField label="Seguro" variant="outlined" size="small" />
            <CustomTextField label="Estado" variant="outlined" size="small" />
            <CustomTextField
              label="Fecha"
              variant="outlined"
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Collapse>

        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          <Table aria-label="appointment table" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Paciente
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Fecha de Cita
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Estado
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Aseguradora
                  </Typography>
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {patient.firstName} {patient.lastName}
                        </Typography>
                        <Typography color="textSecondary" sx={{ fontSize: '13px' }}>
                          {patient.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                      {patient.date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      sx={{
                        px: '4px',
                        backgroundColor: patient.status === 'PE' ? '#ffb833' : '#33ff7d',
                        color: '#fff',
                      }}
                      size="small"
                      label={patient.status === 'PE' ? 'Pendiente' : 'Otro'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">{patient.insurance}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver">
                      <IconButton aria-label="Ver" color="primary" size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton aria-label="Editar" color="secondary" size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Historia Clínica">
                      <IconButton
                        aria-label="Historia Clínica"
                        color="info"
                        size="small"
                        onClick={handleHistoryAccess}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Autorizar Seguro">
                      <IconButton
                        aria-label="Autorizar Seguro"
                        color="success"
                        size="small"
                        onClick={handleAuthorizeInsurance}
                      >
                        <VerifiedUserIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reagendar">
                      <IconButton
                        aria-label="Reagendar"
                        color="warning"
                        size="small"
                        onClick={handleOpenRescheduleModal}
                      >
                        <CalendarTodayIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        aria-label="Eliminar"
                        color="error"
                        size="small"
                        onClick={handleOpenDeleteModal}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Modal de confirmación para eliminar cita */}
        <DeleteConfirmationModal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />

        {/* Modal para autorizar seguros */}
        <AuthorizeInsuranceModal
          open={isAuthorizeModalOpen}
          onClose={() => { if (!isAuthorizeLoading) setIsAuthorizeModalOpen(false); }}
          onAuthorize={handleAuthorizeSubmit}
          loading={isAuthorizeLoading}
          message={authorizeMessage}
          policyNumber={policyNumber}
          setPolicyNumber={setPolicyNumber}
        />

        {/* Modal de éxito de autorización */}
        <AuthorizeInsuranceSuccessModal
          open={isAuthorizeSuccessModalOpen}
          onClose={() => setIsAuthorizeSuccessModalOpen(false)}
          onRevert={handleOpenRevertConfirm}
          onContinue={handleSuccessContinue}
          authorizationNumber={authorizationNumber}
        />

        {/* Modal de confirmación para revertir autorización */}
        <RevertConfirmationModal
          open={isRevertConfirmOpen}
          onClose={handleCloseRevertConfirm}
          onConfirm={handleConfirmRevert}
        />

        {/* Modal para reagendar cita */}
        <RescheduleModal
          open={isRescheduleModalOpen}
          onClose={handleCloseRescheduleModal}
          onReschedule={handleReschedule}
        />
      </>
    </DashboardCard>
  );
};

export default ListAppointments;