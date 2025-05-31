"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Autocomplete,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { httpRequest } from "@/app/utils/http";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Patient {
  id: number;
  personId: number;
  name: string;
  cedula: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  marginBottom: theme.spacing(3),
}));

const ReferralAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
  marginBottom: theme.spacing(2),
  "&:before": { display: "none" },
}));

export default function ReferralPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchOfficeId, setBranchOfficeId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newReferral, setNewReferral] = useState({
    personId: "",
    referralText: "",
    referredDoctorName: "",
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      await fetchPatients();
      const storedBranch = localStorage.getItem("selectedBranchOffice");
      if (storedBranch) {
        setBranchOfficeId(parseInt(storedBranch));
      }
      await loadReferrals();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (patients.length > 0 && !selectedPatient) {
      setSelectedPatient(patients[0]);
      setNewReferral(prev => ({
        ...prev,
        personId: patients[0].personId.toString()
      }));
    }
  }, [patients]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const response: any = await httpRequest({
        url: "/referral/" + localStorage.getItem("selectedBranchOffice"),
        method: "GET",
        requiresAuth: true,
      });

      if (response) {
        setReferrals(response);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar los referimientos");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const branchOfficeId = localStorage.getItem("selectedBranchOffice");
      const res: any = await httpRequest({
        url: "/patient/" + branchOfficeId,
        method: "GET",
        requiresAuth: true,
      });

      const transformedPatients: Patient[] = res.map((patient: any) => ({
        id: patient.patientId,
        personId: patient.person.personId,
        name: `${patient.person.firstName} ${patient.person.lastName}`,
        cedula: patient.person.identityCard || 'N/A'
      }));

      setPatients(transformedPatients);
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
      throw err;
    }
  };

  const handleCreateReferral = async () => {
    try {
      if (!branchOfficeId) {
        throw new Error("No se ha seleccionado una sucursal");
      }

      await httpRequest({
        url:
          "/referral/" +
          localStorage.getItem("doctorId") +
          "/" +
          localStorage.getItem("selectedBranchOffice"),
        method: "POST",
        data: {
          ...newReferral,
          branchOfficeId: localStorage.getItem("selectedBranchOffice")
        },
        requiresAuth: true,
      });

      await loadReferrals();
      setModalOpen(false);
      setNewReferral({
        personId: "",
        referralText: "",
        referredDoctorName: "",
      });
    } catch (err: any) {
      setError(err.message || "Error al crear el referimiento");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardCard
      title="Gestión de Referimientos"
      action={
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={`Total referimientos: ${referrals.length}`}
            color="primary"
            variant="outlined"
          />
          <Fab
            color="primary"
            variant="extended"
            onClick={() => setModalOpen(true)}
            sx={{ position: "fixed", bottom: 16, right: 16 }}
          >
            <AddIcon sx={{ mr: 1 }} />
            Nuevo Referimiento
          </Fab>
        </Box>
      }
    >
      <>
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Nuevo Referimiento Médico</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3} pt={2}>
              <Autocomplete
                options={patients}
                getOptionLabel={(option: Patient) => 
                  `${option.name} - Cédula: ${option.cedula}`
                }
                value={selectedPatient}
                onChange={(_, newValue: Patient | null) => {
                  setSelectedPatient(newValue);
                  setNewReferral(prev => ({
                    ...prev,
                    personId: newValue ? newValue.personId.toString() : ""
                  }));
                }}
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

              <TextField
                label="Nombre del Médico Referido"
                fullWidth
                value={newReferral.referredDoctorName}
                onChange={(e) =>
                  setNewReferral({
                    ...newReferral,
                    referredDoctorName: e.target.value,
                  })
                }
              />

              <TextField
                label="Instrucciones/Referimiento"
                multiline
                rows={4}
                fullWidth
                value={newReferral.referralText}
                onChange={(e) =>
                  setNewReferral({
                    ...newReferral,
                    referralText: e.target.value,
                  })
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleCreateReferral}
              disabled={
                !newReferral.personId ||
                !newReferral.referralText ||
                !newReferral.referredDoctorName
              }
            >
              Guardar Referimiento
            </Button>
          </DialogActions>
        </Dialog>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <StyledPaper>
            {referrals.length === 0 ? (
              <Alert severity="info">No hay referimientos registrados</Alert>
            ) : (
              referrals.map((referral) => (
                <ReferralAccordion key={referral.referralId}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      width="100%"
                      display="flex"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography fontWeight={500}>
                          {referral.patient?.person?.firstName}{" "}
                          {referral.patient?.person?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Referido a: {referral.referredDoctorName}
                        </Typography>
                      </Box>
                      <Chip
                        label={formatDate(referral.createdAt)}
                        color="info"
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                      gap={3}
                    >
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Médico Referidor
                        </Typography>
                        <Typography>
                          {referral.doctor?.person?.firstName}{" "}
                          {referral.doctor?.person?.lastName}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Fecha Referimiento
                        </Typography>
                        <Typography>{formatDate(referral.createdAt)}</Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Detalles del Referimiento
                      </Typography>
                      <Typography whiteSpace="pre-wrap">
                        {referral.referralText}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </ReferralAccordion>
              ))
            )}
          </StyledPaper>
        )}
      </>
    </DashboardCard>
  );
}