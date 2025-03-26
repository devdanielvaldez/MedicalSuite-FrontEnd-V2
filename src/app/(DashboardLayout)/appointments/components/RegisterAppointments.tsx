"use client";

import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide,
  IconButton,
  CircularProgress,
  Grid,
  Autocomplete,
  Paper,
} from "@mui/material";
import {
  LocalizationProvider,
  StaticDatePicker,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import esLocale from "date-fns/locale/es";
import { TransitionProps } from "@mui/material/transitions";
import CloseIcon from "@mui/icons-material/Close";
import { httpRequest } from "@/app/utils/http";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Utilidades de fechas
import isSameDay from "date-fns/isSameDay";
import isBefore from "date-fns/isBefore";
import startOfDay from "date-fns/startOfDay";
import addMinutes from "date-fns/addMinutes";
import format from "date-fns/format";

// Interfaces para los datos
interface BlockDate {
  uuid: string;
  blockDateId: number;
  blockDateBranchOfficeId: number;
  dateBlock: string;
  startTime: string | null;
  endTime: string | null;
  blockAllDay: boolean;
}

interface WorkDay {
  uuid: string;
  availableWorkDaysId: number;
  availableWorkDaysBranchOfficeId: number;
  dayOfWeek: number;
  isActive: boolean;
  workHours: WorkHour[];
}

interface WorkHour {
  uuid: string;
  workHoursId: number;
  availableWorkDaysId: number;
  startTime: string;
  endTime: string;
  patientLimit: number;
  isActive: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  appointments: number;
  patientLimit: number;
  formattedTime?: string;
  workHoursId: number;
}

interface Insurance {
  insuranceId: number;
  insuranceName: string;
  planId?: number;
  planName?: string;
  policyNumber?: string;
}

interface Patient {
  id: string;
  personId: number;
  name: string;
  cedula: string;
  insurance: Insurance | null;
}

// Convierte día de JavaScript (0-6) a sistema (1-7)
const convertJsDayToSystemDay = (jsDay: number): number => {
  const dayMap: { [key: number]: number } = {
    0: 1, // domingo
    1: 2, // lunes
    2: 3, // martes
    3: 4, // miércoles
    4: 5, // jueves
    5: 6, // viernes
    6: 7, // sábado
  };
  return dayMap[jsDay];
};

const extractTimeFromString = (
  timeString: string
): { hours: number; minutes: number; seconds: number } => {
  let hours = 0,
    minutes = 0,
    seconds = 0;

  try {
    if (timeString.includes("Z")) {
      // Extraer directamente las horas/minutos/segundos sin conversión de zona horaria
      const parts = timeString.split(":");
      hours = parseInt(parts[0], 10); // Ej: "14" de "14:00:00.000Z"
      minutes = parseInt(parts[1], 10); // Ej: "00"
      seconds = parseInt(parts[2].split(".")[0], 10) || 0; // Ej: "00"
    } else {
      // Formato local (sin "Z"), extraer directamente
      const parts = timeString.split(":");
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
      seconds = parseInt(parts[2], 10) || 0;
    }
  } catch (error) {
    console.error("Error al extraer tiempo de:", timeString, error);
  }

  return { hours, minutes, seconds };
};

// Para logs de depuración
const formatDateWithoutTime = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const RegisterAppointmentModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  // Estados para la interfaz y datos
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [appointmentReason, setAppointmentReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Datos de backend
  const [patients, setPatients] = useState<Patient[]>([]);
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [blockDates, setBlockDates] = useState<BlockDate[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);

  // Cargar datos necesarios al abrir el modal
  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([
        fetchPatients(),
        fetchWorkDays(),
        fetchBlockDates(),
        fetchAppointments(),
      ]);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      toast.error("Hubo un error al cargar los datos necesarios");
    } finally {
      setLoadingData(false);
    }
  };

  // Cargar pacientes
  const fetchPatients = async () => {
    try {
      const branchOfficeId = localStorage.getItem("selectedBranchOffice");
      const res: any = await httpRequest({
        url: "/patient/" + branchOfficeId,
        method: "GET",
        requiresAuth: true,
      });

      const transformedPatients: Patient[] = res.map((patient: any) => {
        // Verificar si el paciente tiene seguros
        const hasInsurance = patient.person.insurancePerson && 
                            patient.person.insurancePerson.length > 0;
        
        // Extraer información del primer seguro si existe
        let insuranceInfo = null;
        if (hasInsurance) {
          const insurance = patient.person.insurancePerson[0];
          insuranceInfo = {
            insuranceId: insurance.insuranceId,
            insuranceName: insurance.insurance.insuranceName,
            planId: insurance.planId,
            planName: insurance.insurancePlan?.insurancePlanName,
            policyNumber: insurance.policyNumber
          };
        }
        
        return {
          id: patient.patientId,
          personId: patient.person.personId,
          name: `${patient.person.firstName} ${patient.person.lastName}`,
          cedula: patient.person.identityCard,
          insurance: insuranceInfo
        };
      });

      setPatients(transformedPatients);
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
      throw err;
    }
  };

  // Cargar días de trabajo
  const fetchWorkDays = async () => {
    try {
      const branchOfficeId = localStorage.getItem("selectedBranchOffice");
      const res: any = await httpRequest({
        url: "/available-work-days/" + branchOfficeId,
        method: "GET",
        requiresAuth: true,
      });

      setWorkDays(res.data || []);
    } catch (err) {
      console.error("Error al cargar días laborables:", err);
      throw err;
    }
  };

  const fetchBlockDates = async () => {
    try {
      const branchOfficeId = localStorage.getItem("selectedBranchOffice");
      const res: any = await httpRequest({
        url: "/block-dates/by-branch-office/" + branchOfficeId,
        method: "GET",
        requiresAuth: true,
      });
  
      const blockData = res.data || [];
      setBlockDates(blockData);
  
      console.log("Días bloqueados (raw):", blockData);
      console.log("Cantidad de días bloqueados cargados:", blockData.length);
  
      blockData.forEach((block: BlockDate, index: number) => {
        const blockDate = new Date(block.dateBlock);
      });
    } catch (err) {
      console.error("Error al cargar días bloqueados:", err);
      throw err;
    }
  };

  // Cargar citas existentes
  const fetchAppointments = async () => {
    try {
      const branchOfficeId = localStorage.getItem("selectedBranchOffice");
      const res: any = await httpRequest({
        url: "/appointment/by-branch-office/" + branchOfficeId,
        method: "GET",
        requiresAuth: true,
      });

      setExistingAppointments(res.data || []);
    } catch (err) {
      console.error("Error al cargar citas existentes:", err);
      throw err;
    }
  };

  // Verificar si un día es laborable
  const isWorkDay = (date: Date): boolean => {
    const systemDayOfWeek = convertJsDayToSystemDay(date.getDay());

    const matchingWorkDay = workDays.find(
      (wd) => Number(wd.dayOfWeek) === systemDayOfWeek && wd.isActive
    );

    return !!matchingWorkDay;
  };

  const isDayBlocked = (date: Date): boolean => {
    const yearMonthDay = format(date, "yyyy-MM-dd");
  
    for (const block of blockDates) {
      const blockDate = new Date(block.dateBlock);
      const blockYearMonthDay = format(blockDate, "yyyy-MM-dd");
  
      if (yearMonthDay === blockYearMonthDay && block.blockAllDay) {
        return true;
      }
    }
  
    return false;
  };

  const getBlockInfoForDate = (date: Date): BlockDate[] => {
    const yearMonthDay = format(date, "yyyy-MM-dd");

    const blocksForDate = blockDates.filter((block) => {
      const blockYearMonthDay = format(new Date(block.dateBlock), "yyyy-MM-dd");

      return yearMonthDay === blockYearMonthDay && !block.blockAllDay;
    });

    if (blocksForDate.length > 0) {
      console.log(
        `Se encontraron ${blocksForDate.length} bloques parciales para ${yearMonthDay}`
      );
    }

    return blocksForDate;
  };

  const getWorkHoursForDay = (date: Date): WorkHour[] => {
    const systemDayOfWeek = convertJsDayToSystemDay(date.getDay());

    const matchingWorkDay = workDays.find(
      (wd) => Number(wd.dayOfWeek) === systemDayOfWeek && wd.isActive
    );

    return matchingWorkDay?.workHours.filter((wh) => wh.isActive) || [];
  };

  const getAppointmentsForDate = (date: Date): any[] => {
    return existingAppointments.filter((app) =>
      isSameDay(new Date(app.date), date)
    );
  };

  const isTimeSlotBlocked = (
    slotStart: { hours: number; minutes: number; seconds: number },
    slotEnd: { hours: number; minutes: number; seconds: number },
    blocks: BlockDate[]
  ): boolean => {
    const slotStartMinutes = slotStart.hours * 60 + slotStart.minutes;
    const slotEndMinutes = slotEnd.hours * 60 + slotEnd.minutes;
  
    // Formatear slot para logs en 12 horas
    const slotStartFormatted = format(
      new Date().setHours(slotStart.hours, slotStart.minutes, 0),
      "h:mm a",
      { locale: esLocale }
    );
    const slotEndFormatted = format(
      new Date().setHours(slotEnd.hours, slotEnd.minutes, 0),
      "h:mm a",
      { locale: esLocale }
    );
  
    for (const block of blocks) {
      if (!block.startTime || !block.endTime) continue;
  
      const blockStart = extractTimeFromString(block.startTime);
      const blockEnd = extractTimeFromString(block.endTime);
  
      const blockStartMinutes = blockStart.hours * 60 + blockStart.minutes;
      const blockEndMinutes = blockEnd.hours * 60 + blockEnd.minutes;
  
      // Formatear bloqueo para logs en 12 horas
      const blockStartFormatted = format(
        new Date().setHours(blockStart.hours, blockStart.minutes, 0),
        "h:mm a",
        { locale: esLocale }
      );
      const blockEndFormatted = format(
        new Date().setHours(blockEnd.hours, blockEnd.minutes, 0),
        "h:mm a",
        { locale: esLocale }
      );
  
      if (
        (slotStartMinutes >= blockStartMinutes && slotStartMinutes < blockEndMinutes) ||
        (slotEndMinutes > blockStartMinutes && slotEndMinutes <= blockEndMinutes) ||
        (slotStartMinutes <= blockStartMinutes && slotEndMinutes >= blockEndMinutes)
      ) {
        console.log(
          `Slot ${slotStartFormatted}-${slotEndFormatted} bloqueado por ${blockStartFormatted}-${blockEndFormatted}`
        );
        return true;
      }
    }
  
    return false;
  };
  
  // Generar slots de tiempo disponibles para un día
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    if (!isWorkDay(date) || isDayBlocked(date)) {
      console.log(
        `Generación de slots para ${format(
          date,
          "yyyy-MM-dd"
        )}: Día no laborable o bloqueado`
      );
      return [];
    }
  
    const workHours = getWorkHoursForDay(date);
    const blockInfo = getBlockInfoForDate(date);
    const appointments = getAppointmentsForDate(date);
    let allSlots: TimeSlot[] = [];
  
    workHours.forEach((wh) => {
      const startTimeObj = extractTimeFromString(wh.startTime);
      const endTimeObj = extractTimeFromString(wh.endTime);
  
      let currentHour = startTimeObj.hours;
      let currentMinute = startTimeObj.minutes;
  
      while (
        currentHour < endTimeObj.hours ||
        (currentHour === endTimeObj.hours && currentMinute < endTimeObj.minutes)
      ) {
        let endMinute = currentMinute + 30;
        let endHour = currentHour;
  
        if (endMinute >= 60) {
          endHour++;
          endMinute -= 60;
        }
  
        if (
          endHour > endTimeObj.hours ||
          (endHour === endTimeObj.hours && endMinute > endTimeObj.minutes)
        ) {
          break;
        }
  
        const slotStart = { hours: currentHour, minutes: currentMinute, seconds: 0 };
        const slotEnd = { hours: endHour, minutes: endMinute, seconds: 0 };
  
        const isBlocked = isTimeSlotBlocked(slotStart, slotEnd, blockInfo);
  
        if (!isBlocked) {
          const appointmentsInSlot = appointments.filter((app) => {
            const appTimeStart = extractTimeFromString(app.startTime);
            const appTimeEnd = extractTimeFromString(app.endTime);
  
            const appStartMinutes = appTimeStart.hours * 60 + appTimeStart.minutes;
            const appEndMinutes = appTimeEnd.hours * 60 + appTimeEnd.minutes;
            const slotStartMinutes = slotStart.hours * 60 + slotStart.minutes;
            const slotEndMinutes = slotEnd.hours * 60 + slotEnd.minutes;
  
            return (
              (appStartMinutes <= slotStartMinutes && appEndMinutes > slotStartMinutes) ||
              (appStartMinutes < slotEndMinutes && appEndMinutes >= slotEndMinutes) ||
              (appStartMinutes >= slotStartMinutes && appEndMinutes <= slotEndMinutes)
            );
          }).length;
  
          const available = appointmentsInSlot < wh.patientLimit;
  
          const startTimeStr = `${String(slotStart.hours).padStart(2, "0")}:${String(slotStart.minutes).padStart(2, "0")}:00`;
          const endTimeStr = `${String(slotEnd.hours).padStart(2, "0")}:${String(slotEnd.minutes).padStart(2, "0")}:00`;
  
          const formattedStart = format(
            new Date().setHours(slotStart.hours, slotStart.minutes, 0),
            "h:mm a",
            { locale: esLocale }
          );
          const formattedEnd = format(
            new Date().setHours(slotEnd.hours, slotEnd.minutes, 0),
            "h:mm a",
            { locale: esLocale }
          );
          const formattedTime = `${formattedStart} - ${formattedEnd}`;
  
          allSlots.push({
            startTime: startTimeStr,
            endTime: endTimeStr,
            available,
            appointments: appointmentsInSlot,
            patientLimit: wh.patientLimit,
            formattedTime,
            workHoursId: wh.workHoursId
          });
        }
  
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour++;
          currentMinute -= 60;
        }
      }
    });
  
    console.log(`Se generaron ${allSlots.length} slots para ${format(date, "yyyy-MM-dd")}`);
    return allSlots;
  };

  useEffect(() => {
    if (selectedDate && !loadingData) {
      console.log(`Generando slots para: ${formatDateWithoutTime(selectedDate)}`);
      const slots = generateTimeSlots(selectedDate);
      setTimeSlots(slots);
      setSelectedTimeSlot(null);
    }
  }, [selectedDate, workDays, blockDates, existingAppointments, loadingData]);

  const CustomPickersDay = (props: PickersDayProps<Date>) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const today = startOfDay(new Date());
    const isPast = isBefore(day, today);
    const isBlocked = isDayBlocked(day);
    const isWorkingDay = isWorkDay(day);
  
    return (
      <PickersDay
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        {...other}
        disabled={isPast || isBlocked || !isWorkingDay}
        sx={{
          backgroundColor: isPast
            ? "grey.300"
            : isBlocked
            ? "error.main"
            : isWorkingDay
            ? "success.main"
            : "grey.300",
          color: isPast || !isWorkingDay || isBlocked ? "grey.600" : "#fff",
          borderRadius: "50%",
          "&:hover": {
            backgroundColor:
              isPast || isBlocked || !isWorkingDay ? undefined : "success.dark",
          },
        }}
      />
    );
  };

  // Manejar envío del formulario
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedPatient || !selectedDate || !selectedTimeSlot) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    setIsLoading(true);

    try {
      // Formatear la fecha para el backend
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      const appointmentData = {
        "statusAppointment": "PE",
        "appointmentPersonId": +selectedPatient.personId,
        "date": formattedDate,
        "isWithInsurance": !!selectedPatient.insurance, // Automáticamente true si tiene seguro, false si no
        "isDoctorToVisit": false,
        "patientMotive": appointmentReason,
        "time": selectedTimeSlot.startTime,
        "appointmentWorkHoursId": selectedTimeSlot.workHoursId
      }

      // Enviar la cita al backend
      await httpRequest({
        url: "/appointment/" + localStorage.getItem('selectedBranchOffice'),
        method: "POST",
        data: appointmentData,
        requiresAuth: true,
      });

      toast.success("Cita agendada correctamente");
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Error al agendar la cita:", error);
      toast.error(error.data?.message || "Hubo un error al agendar la cita");
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setSelectedPatient(null);
    setSelectedDate(new Date());
    setSelectedTimeSlot(null);
    setAppointmentReason("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          position: "relative",
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        Agendar Nueva Cita
        <IconButton
          aria-label="cerrar"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "grey.600",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <ToastContainer />

      <DialogContent dividers>
        {loadingData ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Columna de selección de paciente y motivo */}
              <Grid item xs={12} md={5}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 2 }}
                  >
                    Información de la cita
                  </Typography>

                  <Autocomplete
                    options={patients}
                    getOptionLabel={(option) =>
                      `${option.name} (${option.cedula || 'Sin cédula'})`
                    }
                    value={selectedPatient}
                    onChange={(_, newValue) => setSelectedPatient(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Seleccionar Paciente"
                        variant="outlined"
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

                  {/* Mostrar información del seguro si existe */}
                  {selectedPatient && selectedPatient.insurance && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "#f5f5f5",
                        borderRadius: 2,
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} color="primary">
                        Información de Seguro
                      </Typography>
                      <Typography variant="body2">
                        <strong>Seguro:</strong> {selectedPatient.insurance.insuranceName}
                      </Typography>
                      {selectedPatient.insurance.planName && (
                        <Typography variant="body2">
                          <strong>Plan:</strong> {selectedPatient.insurance.planName}
                        </Typography>
                      )}
                      {selectedPatient.insurance.policyNumber && (
                        <Typography variant="body2">
                          <strong>No. Póliza:</strong> {selectedPatient.insurance.policyNumber}
                        </Typography>
                      )}
                    </Paper>
                  )}

                  <TextField
                    label="Motivo de la cita"
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ mb: 2 }}
                  />

                  {/* Mostrar el horario seleccionado con color oscuro */}
                  {selectedTimeSlot && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "#1a2035", // Color oscuro personalizado
                        borderRadius: 2,
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="white"
                        fontWeight={600}
                      >
                        Horario seleccionado
                      </Typography>
                      <Typography variant="body2" color="white">
                        {selectedDate
                          ? format(selectedDate, "EEEE dd/MM/yyyy", {
                              locale: esLocale,
                            })
                          : ""}{" "}
                        a las {selectedTimeSlot.formattedTime}
                      </Typography>
                    </Paper>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={
                      !selectedPatient || !selectedTimeSlot || isLoading
                    }
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Confirmar Cita"
                    )}
                  </Button>
                </Box>
              </Grid>

              {/* Columna del calendario */}
              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ mb: 1 }}
                    >
                      Seleccione una fecha disponible
                    </Typography>

                    {/* Leyenda del calendario */}
                    <Box
                      sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            bgcolor: "success.main",
                          }}
                        />
                        <Typography variant="caption">Disponible</Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            bgcolor: "error.main",
                          }}
                        />
                        <Typography variant="caption">Bloqueado</Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            bgcolor: "grey.300",
                          }}
                        />
                        <Typography variant="caption">No disponible</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={esLocale}
                  >
                    <StaticDatePicker
                      displayStaticWrapperAs="desktop"
                      openTo="day"
                      value={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      slots={{ day: CustomPickersDay }}
                      disablePast
                    />
                  </LocalizationProvider>

                  {/* Mostrar los slots de tiempo disponibles */}
                  {selectedDate && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{ mb: 2 }}
                      >
                        Horarios disponibles
                      </Typography>

                      {timeSlots.length > 0 ? (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {timeSlots.map((slot, index) => (
                            <Button
                            key={index}
                            variant={
                              selectedTimeSlot === slot
                                ? "contained"
                                : "outlined"
                            }
                            color={slot.available ? "primary" : "error"}
                            disabled={!slot.available}
                            onClick={() => setSelectedTimeSlot(slot)}
                            size="small"
                            sx={{
                              borderRadius: 4,
                              fontSize: "0.75rem",
                              px: 1,
                              py: 0.5,
                            }}
                          >
                            {slot.formattedTime}
                          </Button>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay horarios disponibles para este día.
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </DialogContent>
  </Dialog>
);
};

export default RegisterAppointmentModal;