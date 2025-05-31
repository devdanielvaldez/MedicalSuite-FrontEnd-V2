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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { httpRequest } from "@/app/utils/http";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionIcon from "@mui/icons-material/Description";
import AddIcon from "@mui/icons-material/Add";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Patient {
  id: number;
  personId: number;
  name: string;
  cedula: string;
}

interface LicenseCertificate {
  id: number;
  type: string;
  requestDate: string;
  issueDate: string;
  observations?: string;
  patient: {
    person: {
      personId: number;
      firstName: string;
      lastName: string;
    };
  };
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  marginBottom: theme.spacing(3),
}));

const DocumentAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
  marginBottom: theme.spacing(2),
  "&:before": { display: "none" },
}));

export default function LicenseCertificatePage() {
  const [documents, setDocuments] = useState<LicenseCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filters, setFilters] = useState({
    type: "all",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  
  const [newDocument, setNewDocument] = useState({
    type: "LICENSE",
    issueDate: new Date(),
    observations: "",
  });

  useEffect(() => {
    fetchPatients();
    loadDocuments();
  }, [filters]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const branchOfficeId = localStorage.getItem("selectedBranchOffice");
      let url = `/license-certificates/${branchOfficeId}`;

      const response: any = await httpRequest({
        url,
        method: "GET",
        requiresAuth: true,
      });

      setDocuments(response);
    } catch (err: any) {
      setError(err.message || "Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const branchOfficeId = localStorage.getItem("selectedBranchOffice");
      const res: any = await httpRequest({
        url: `/patient/${branchOfficeId}`,
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
    }
  };

  const handleCreateDocument = async () => {
    try {
      const branchOfficeId = localStorage.getItem("selectedBranchOffice");
      if (!branchOfficeId || !selectedPatient) return;

      await httpRequest({
        url: "/license-certificates",
        method: "POST",
        data: {
          personId: selectedPatient.personId,
          branchOfficeId: parseInt(branchOfficeId),
          type: newDocument.type,
          issueDate: newDocument.issueDate.toISOString(),
          observations: newDocument.observations,
        },
        requiresAuth: true,
      });

      await loadDocuments();
      setModalOpen(false);
      setNewDocument({
        type: "LICENSE",
        issueDate: new Date(),
        observations: "",
      });
    } catch (err: any) {
      setError(err.message || "Error al crear documento");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <DashboardCard
      title="Gestión de Licencias y Certificados"
      action={
        <Box display="flex" alignItems="center" gap={2}>
          <Fab
            color="primary"
            variant="extended"
            onClick={() => setModalOpen(true)}
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
          >
            <AddIcon sx={{ mr: 1 }} />
            Nuevo Documento
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
          <DialogTitle>Nuevo Documento Médico</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3} pt={2}>
              <Autocomplete
                options={patients}
                getOptionLabel={(option: Patient) => 
                  `${option.name} - Cédula: ${option.cedula}`
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
                  />
                )}
              />

              <FormControl fullWidth>
                <InputLabel>Tipo de documento</InputLabel>
                <Select
                  value={newDocument.type}
                  onChange={(e) => setNewDocument({...newDocument, type: e.target.value})}
                  label="Tipo de documento"
                >
                  <MenuItem value="LICENSE">Licencia</MenuItem>
                  <MenuItem value="CERTIFICATE">Certificado</MenuItem>
                </Select>
              </FormControl>

              <DatePicker
                selected={newDocument.issueDate}
                onChange={(date: any) => setNewDocument({...newDocument, issueDate: date})}
                dateFormat="dd/MM/yyyy"
                customInput={
                  <TextField
                    label="Fecha de emisión"
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                }
              />

              <TextField
                label="Observaciones"
                multiline
                rows={3}
                fullWidth
                value={newDocument.observations}
                onChange={(e) => setNewDocument({...newDocument, observations: e.target.value})}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleCreateDocument}
              disabled={!selectedPatient || !newDocument.issueDate}
            >
              Guardar Documento
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
            {documents.length === 0 ? (
              <Alert severity="info">No hay documentos registrados</Alert>
            ) : (
              documents.map((doc) => (
                <DocumentAccordion key={doc.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box width="100%" display="flex" justifyContent="space-between">
                      <Box>
                        <Typography fontWeight={500}>
                          {doc.patient.person.firstName} {doc.patient.person.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doc.type === 'LICENSE' ? 'Licencia' : 'Certificado'} · 
                          Emitido: {formatDate(doc.issueDate)}
                        </Typography>
                      </Box>
                      <Chip
                        label={doc.type === 'LICENSE' ? 'Licencia' : 'Certificado'}
                        color={doc.type === 'LICENSE' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Fecha de solicitud
                        </Typography>
                        <Typography>{formatDate(doc.requestDate)}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Fecha de emisión
                        </Typography>
                        <Typography>{formatDate(doc.issueDate)}</Typography>
                      </Box>
                    </Box>

                    {doc.observations && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Observaciones
                          </Typography>
                          <Typography whiteSpace="pre-wrap">
                            {doc.observations}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </AccordionDetails>
                </DocumentAccordion>
              ))
            )}
          </StyledPaper>
        )}
      </>
    </DashboardCard>
  );
}