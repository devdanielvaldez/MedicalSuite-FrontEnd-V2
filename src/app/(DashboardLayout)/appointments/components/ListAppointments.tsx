"use client";

import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)//components/shared/DashboardCard";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import BorderAllIcon from "@mui/icons-material/BorderAll";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { es } from "date-fns/locale";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import { httpRequest } from "@/app/utils/http";
import { formatIdentityCard, formatPhoneNumber } from "@/app/utils/utils";
import { useRouter } from "next/navigation";

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------
interface Appointment {
  appointmentId: number;
  uuid?: string;
  date: string;
  time: string;
  statusAppointment: string;
  patientMotive: string;
  isWithInsurance?: boolean;
  isDoctorToVisit?: boolean;
  person: {
    personId: number;
    firstName: string;
    lastName: string;
    identityCard?: string;
    phoneNumber?: string;
    insurancePerson?: any;
    contact?: any;
  };
  doctor?: {
    doctorId: number;
    doctorPersonId: number;
  };
  branchOffice?: {
    branchOfficeId: number;
    nameBranchOffice: string;
  };
  workHour?: {
    workHoursId: number;
    startTime: string;
    endTime: string;
  };
}

// -----------------------------------------------------------------------------
// Funciones de utilidad
// -----------------------------------------------------------------------------
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (timeString: string): string => {
  if (!timeString) return "";

  // Convertir el formato "HH:MM:SS" a "HH:MM AM/PM"
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minutes} ${ampm}`;
};

const getStatusText = (status: string): { text: string; color: string } => {
  switch (status) {
    case "PE":
      return { text: "Pendiente", color: "#ffb833" };
    case "CO":
      return { text: "Confirmada", color: "#33ff7d" };
    case "CA":
      return { text: "Cancelada", color: "#ff5252" };
    case "RE":
      return { text: "Reprogramada", color: "#5277ff" };
    default:
      return { text: "Desconocido", color: "#999999" };
  }
};

// -----------------------------------------------------------------------------
// Styled Component
// -----------------------------------------------------------------------------
const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    "& fieldset": {
      borderColor: theme.palette.divider,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
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
      <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
        Confirmar Eliminación
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, mb: 2, textAlign: "center" }}>
          ¿Está seguro de que desea eliminar la cita?
        </Box>
        <Box display="flex" justifyContent="space-between" gap={2}>
          <Button variant="outlined" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={onConfirm}
          >
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
          background: "linear-gradient(135deg, #ffffff, #f7f7f7)",
        },
      }}
    >
      <DialogTitle
        sx={{ textAlign: "center", fontWeight: 600, position: "relative" }}
      >
        Autorizar Seguro
        {!loading && (
          <IconButton
            aria-label="cerrar"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8, color: "grey.600" }}
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
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
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

const AuthorizeInsuranceSuccessModal: React.FC<
  AuthorizeInsuranceSuccessModalProps
> = ({ open, onClose, onRevert, onContinue, authorizationNumber }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { p: 3, borderRadius: 2, boxShadow: 3, textAlign: "center" },
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
      <DialogActions sx={{ justifyContent: "space-between" }}>
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
      <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
        Confirmar Reversión
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, mb: 2, textAlign: "center" }}>
          ¿Está seguro de que desea revertir la autorización?
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
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

// Modal para ver los detalles completos de una cita
interface AppointmentDetailModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  open,
  onClose,
  appointment,
}) => {
  if (!appointment) return null;

  const statusInfo = getStatusText(appointment.statusAppointment);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
          background: "linear-gradient(135deg, #ffffff, #f7f7f7)",
        },
      }}
    >
      <DialogTitle
        sx={{ textAlign: "center", fontWeight: 600, position: "relative" }}
      >
        Detalles de la Cita
        <IconButton
          aria-label="cerrar"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "grey.600" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 2 }}>
          {/* Sección de información del paciente */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                color: "primary.main",
                borderBottom: "1px solid",
                borderColor: "divider",
                pb: 1,
              }}
            >
              Datos del {appointment.isDoctorToVisit ? "Visitador" : "Paciente"}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nombre completo:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {appointment.person.firstName} {appointment.person.lastName}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Cédula:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {appointment.person.identityCard
                    ? formatIdentityCard(appointment.person.identityCard)
                    : "No registrada"}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {appointment.person.contact && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: "primary.main",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  pb: 1,
                }}
              >
                Información de Contacto
              </Typography>

              {appointment.person.contact.phoneNumbers &&
              appointment.person.contact.phoneNumbers.length > 0 ? (
                <Grid container spacing={2}>
                  {appointment.person.contact.phoneNumbers.map(
                    (phone: any, index: number) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {phone.label} ({phone.typePhone}):
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatPhoneNumber(phone.phoneNumber)}
                          {phone.country && (
                            <span
                              style={{
                                fontSize: "0.85rem",
                                color: "text.secondary",
                                marginLeft: "4px",
                              }}
                            >
                              ({phone.country})
                            </span>
                          )}
                        </Typography>
                      </Grid>
                    )
                  )}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay números de teléfono registrados.
                </Typography>
              )}

              {appointment.person.contact.socialNetworks &&
                appointment.person.contact.socialNetworks.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Redes sociales:
                    </Typography>
                    <Grid container spacing={2}>
                      {appointment.person.contact.socialNetworks.map(
                        (social: any, index: number) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Typography variant="body2">
                              {social.name}: {social.username || social.url}
                            </Typography>
                          </Grid>
                        )
                      )}
                    </Grid>
                  </Box>
                )}
            </Box>
          )}

          {/* Sección de información de la cita */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                color: "primary.main",
                borderBottom: "1px solid",
                borderColor: "divider",
                pb: 1,
              }}
            >
              Detalles de la Cita
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatDate(appointment.date)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Hora:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatTime(appointment.time)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estado:
                </Typography>
                <Chip
                  sx={{
                    px: "8px",
                    backgroundColor: statusInfo.color,
                    color: "#fff",
                  }}
                  label={statusInfo.text}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Cobertura:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {appointment.isWithInsurance ? "Con seguro" : "Sin seguro"}
                </Typography>
              </Grid>

              {appointment.isDoctorToVisit !== undefined && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Es un Visitador Medico:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {appointment.isDoctorToVisit ? "Sí" : "No"}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Información del seguro (si aplica) */}
          {appointment.isWithInsurance && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: "primary.main",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  pb: 1,
                }}
              >
                Información del Seguro
              </Typography>

              {appointment.person.insurancePerson &&
              appointment.person.insurancePerson.length > 0 ? (
                appointment.person.insurancePerson.map(
                  (insuranceInfo: any, index: any) => (
                    <Box
                      key={insuranceInfo.insurancePersonId || index}
                      sx={{
                        mb:
                          index < appointment.person.insurancePerson.length - 1
                            ? 3
                            : 0,
                      }}
                    >
                      {index > 0 && <Divider sx={{ my: 2 }} />}
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Aseguradora:
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {insuranceInfo.insurance?.insuranceName ||
                              "No disponible"}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Plan:
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {insuranceInfo.insurancePlan?.insurancePlanName ||
                              "No disponible"}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            No. Póliza:
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {insuranceInfo.policyNumber || "No registrado"}
                          </Typography>
                        </Grid>

                        {insuranceInfo.insurancePlan && (
                          <Grid item xs={12}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Descripción del Plan:
                            </Typography>
                            <Typography variant="body1">
                              {insuranceInfo.insurancePlan
                                .insurancePlanDescription || "Sin descripción"}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )
                )
              ) : (
                <Box sx={{ p: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Esta cita está marcada como "Con seguro" pero no se
                    encontraron detalles del seguro asociados al paciente.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Información de la sucursal */}
          {appointment.branchOffice && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: "primary.main",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  pb: 1,
                }}
              >
                Sucursal
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nombre de la Sucursal:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {appointment.branchOffice.nameBranchOffice}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>

        {/* Motivo de la cita */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: "primary.main",
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 1,
            }}
          >
            Motivo de la Cita
          </Typography>
          <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
            <Typography variant="body1">
              {appointment.patientMotive ||
                "No se especificó un motivo para la cita"}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// -----------------------------------------------------------------------------
// Componente principal: ListAppointments
// -----------------------------------------------------------------------------
const ListAppointments = () => {
  // Estados para las citas
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros y exportación
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null
  );

  // Estados para los modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);

  // Estados para autorización de seguros
  const [isAuthorizeModalOpen, setIsAuthorizeModalOpen] = useState(false);
  const [isAuthorizeLoading, setIsAuthorizeLoading] = useState(false);
  const [authorizeMessage, setAuthorizeMessage] = useState("");
  const [isAuthorizeSuccessModalOpen, setIsAuthorizeSuccessModalOpen] =
    useState(false);
  const [policyNumber, setPolicyNumber] = useState("");
  const [authorizationNumber, setAuthorizationNumber] = useState("");
  const [isRevertConfirmOpen, setIsRevertConfirmOpen] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointmentForDetail, setSelectedAppointmentForDetail] =
    useState<Appointment | null>(null);
  const router = useRouter();

  const theme = useTheme();

  // Cargar las citas al montar el componente
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Función para obtener todas las citas
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const branchOfficeId = localStorage.getItem("selectedBranchOffice");
      const doctorId = localStorage.getItem("doctorId"); // Si es necesario filtrar por doctor

      let url = `/appointment/by-branch-office/${branchOfficeId}`;
      if (doctorId) {
        url += `?doctorId=${doctorId}`;
      }

      const response: any = await httpRequest({
        url: url,
        method: "GET",
        requiresAuth: true,
      });

      if (response && response.data) {
        // Determinar si la respuesta es paginada o un array simple
        const appointmentData = response.data.items || response.data;
        setAppointments(appointmentData);
        console.log("Citas cargadas:", appointmentData);
      } else {
        setAppointments([]);
      }
    } catch (err: any) {
      console.error("Error al cargar citas:", err);
      setError(err.message || "Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para filtros y exportación
  const handleToggleFilter = () => {
    setFilterOpen((prev) => !prev);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExport = () => {
    setExportAnchorEl(null);
  };

  // Handlers para el modal de eliminación
  const handleOpenDeleteModal = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAppointmentId(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedAppointmentId) {
      setIsDeleteModalOpen(false);
      setLoading(true);

      try {
        await httpRequest({
          url: `/appointment/${selectedAppointmentId}`,
          method: "DELETE",
          requiresAuth: true,
        });

        // Actualizar la lista de citas eliminando la cita borrada
        setAppointments((prev) =>
          prev.filter((app) => app.appointmentId !== selectedAppointmentId)
        );
        console.log("Cita eliminada:", selectedAppointmentId);
      } catch (err: any) {
        console.error("Error al eliminar la cita:", err);
        setError(err.message || "Error al eliminar la cita");
      } finally {
        setLoading(false);
        setSelectedAppointmentId(null);
      }
    }
  };

  // Handlers para autorización de seguro
  const handleAuthorizeInsurance = () => {
    setIsAuthorizeModalOpen(true);
  };

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
          const randomAuth = Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, "0");
          setAuthorizationNumber(randomAuth);
          setIsAuthorizeSuccessModalOpen(true);
          setPolicyNumber("");
          setAuthorizeMessage("");
        }, 2000);
      }, 2000);
    }, 2000);
  };

  // Handlers para la reversión de autorización
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

  const handleOpenDetailModal = (appointment: Appointment) => {
    setSelectedAppointmentForDetail(appointment);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAppointmentForDetail(null);
  };

  const handleHistoryAccess = (appointment: any) => {
    router.push(`/medical-history/${appointment.appointmentId}/${appointment.person.personId}/${appointment.person.personId}`);
  };

  // Renderizado del componente
  return (
    <DashboardCard
      title="Gestión de citas"
      subtitle="Visualiza y controla tus citas"
    >
      <>
        <Box mb={2} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
            onClick={handleToggleFilter}
          >
            Filtros
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadForOfflineIcon />}
            onClick={handleExportClick}
          >
            Exportar
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={handleCloseExport}
          >
            <MenuItem
              onClick={() => {
                handleCloseExport();
                console.log("Exportar a Excel");
              }}
            >
              <BorderAllIcon sx={{ mr: 1 }} />
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseExport();
                console.log("Exportar a PDF");
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ overflow: "auto", width: { xs: "280px", sm: "auto" } }}>
            <Table
              aria-label="appointment table"
              sx={{ whiteSpace: "nowrap", mt: 2 }}
            >
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
                      ¿Es Asegurad(a)?
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
                {appointments.length > 0 ? (
                  appointments.map((appointment) => {
                    const statusInfo = getStatusText(
                      appointment.statusAppointment
                    );
                    return (
                      <TableRow key={appointment.appointmentId}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {appointment.person.firstName}{" "}
                                {appointment.person.lastName}
                              </Typography>
                              <Typography
                                color="textSecondary"
                                sx={{ fontSize: "13px" }}
                              >
                                {appointment.person.phoneNumber ||
                                  appointment.person.identityCard ||
                                  "Sin teléfono"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            color="textSecondary"
                            variant="subtitle2"
                            fontWeight={400}
                          >
                            {formatDate(appointment.date)}{" "}
                            {formatTime(appointment.time)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            sx={{
                              px: "4px",
                              backgroundColor: statusInfo.color,
                              color: "#fff",
                            }}
                            size="small"
                            label={statusInfo.text}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6">
                            {appointment.isWithInsurance
                              ? "CON SEGURO"
                              : "SIN SEGURO"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalles">
                            <IconButton
                              aria-label="Ver detalles"
                              color="primary"
                              size="small"
                              onClick={() => handleOpenDetailModal(appointment)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Historia Clínica">
                            <IconButton
                              aria-label="Historia Clínica"
                              color="info"
                              size="small"
                              onClick={() => handleHistoryAccess(appointment)}
                            >
                              <HistoryIcon />
                            </IconButton>
                          </Tooltip>
                          {appointment.isWithInsurance && (
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
                          )}
                          <Tooltip title="Eliminar">
                            <IconButton
                              aria-label="Eliminar"
                              color="error"
                              size="small"
                              onClick={() =>
                                handleOpenDeleteModal(appointment.appointmentId)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1">
                        No hay citas disponibles
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Modales */}
        <DeleteConfirmationModal
          open={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />

        {/* Modal para autorizar seguros */}
        <AuthorizeInsuranceModal
          open={isAuthorizeModalOpen}
          onClose={() => {
            if (!isAuthorizeLoading) setIsAuthorizeModalOpen(false);
          }}
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

        <AppointmentDetailModal
          open={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          appointment={selectedAppointmentForDetail}
        />

        {/* Modal de confirmación para revertir autorización */}
        <RevertConfirmationModal
          open={isRevertConfirmOpen}
          onClose={handleCloseRevertConfirm}
          onConfirm={handleConfirmRevert}
        />
      </>
    </DashboardCard>
  );
};

export default ListAppointments;
