"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
  Checkbox,
  FormGroup,
  FormControlLabel,
  ListItemText,
  Tooltip,
  Fab,
  Badge,
  CardActions,
  Autocomplete,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { httpRequest } from "@/app/utils/http";
import { formatIdentityCard, formatPhoneNumber } from "@/app/utils/utils";
import { useParams, useRouter } from "next/navigation";
import { jsPDF } from "jspdf"; // Importar jsPDF

// Icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import PersonIcon from "@mui/icons-material/Person";
import EventNoteIcon from "@mui/icons-material/EventNote";
import DocumentIcon from "@mui/icons-material/Description";
import MedicationIcon from "@mui/icons-material/Medication";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";

// -----------------------------------------------------------------------------
// Enum for field data types
// -----------------------------------------------------------------------------
enum FieldDataType {
  NUMERO = "NUMERO",
  LISTA = "LISTA",
  TEXTO = "TEXTO",
  TEXTO_LARGO = "TEXTO_LARGO",
  FECHA = "FECHA",
  MULTIPLE = "MULTIPLE",
  BOOLEANO = "BOOLEANO",
}

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------
interface TemplateField {
  id: number;
  templateId: number;
  fieldName: string;
  dataType: FieldDataType;
  listOptions: string | null;
  fieldOrder: number;
  isActive: boolean;
  validationRules: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Template {
  id: number;
  doctorId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  fields: TemplateField[];
}

interface Person {
  personId: number;
  firstName: string;
  lastName: string;
  identityCard?: string;
  gender?: string;
  birthday?: string;
  contact?: {
    phoneNumbers?: Array<{
      phoneNumber: string;
      typePhone: string;
    }>;
  };
  contactId?: number;
  addressId?: number;
}

interface Doctor {
  uuid: string;
  embedding: any;
  userCreatorId: number;
  userUpdatesId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  doctorId: number;
  doctorPersonId: number;
}

interface MedicalHistory {
  id: number;
  personId: number;
  creatorDoctorId: number;
  templateId: number;
  data: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
  status: string;
  template: Template;
  creatorDoctor: Doctor;
}

interface MedicalHistoryFormValues {
  [key: string]: any;
}

interface Medication {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface MedicalIndication {
  id: number;
  medicalHistoryId: number;
  medicationId: number;
  medication: Medication;
  dosageAmount: number;
  dosageUnit: string;
  administrationRoute: string;
  frequencyAmount: number;
  frequencyUnit: string;
  totalDuration?: number;
  durationUnit?: string;
  specialInstructions?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Styled Components
// -----------------------------------------------------------------------------
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  background: "linear-gradient(135deg, #ffffff, #f7f7f7)",
}));

const PatientInfoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.08)",
  marginBottom: theme.spacing(3),
}));

const FormField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
  marginBottom: theme.spacing(2),
  "&:before": {
    display: "none",
  },
}));

const SaveButton = styled(Button)(({ theme }) => ({
  position: "sticky",
  bottom: theme.spacing(2),
  display: "block",
  width: "100%",
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(3),
  zIndex: 5,
}));

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------
const parseValidationRules = (rules: string | null): any => {
  if (!rules) return {};
  try {
    return JSON.parse(rules);
  } catch (e) {
    console.error("Error parsing validation rules:", e);
    return {};
  }
};

const calculateAge = (birthday: string | undefined): string => {
  if (!birthday) return "N/A";

  const birthDate = new Date(birthday);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return `${age} años`;
};

const formatDate = (date: string | undefined): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Calcular fecha de expiración (1 año desde ahora)
const calculateExpiryDate = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------
export default function PatientMedicalHistory() {
  // Router and params
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.appointmentId as string;
  const personId = params.personId as string;

  // States
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [formValues, setFormValues] = useState<MedicalHistoryFormValues>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [person, setPerson] = useState<Person | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // New states for medical indications
  const [medications, setMedications] = useState<Medication[]>([]);
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>(
    []
  );
  const [searchMedication, setSearchMedication] = useState<string>("");
  const [loadingMedications, setLoadingMedications] = useState<boolean>(false);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [medicalIndications, setMedicalIndications] = useState<
    MedicalIndication[]
  >([]);
  const [loadingIndications, setLoadingIndications] = useState<boolean>(false);
  const [indicationFormValues, setIndicationFormValues] = useState({
    medicationId: null as number | null,
    medicationName: "",
    dosageAmount: "",
    dosageUnit: "mg",
    administrationRoute: "oral",
    frequencyAmount: "",
    frequencyUnit: "horas",
    totalDuration: "",
    durationUnit: "días",
    specialInstructions: "",
  });
  const [savingIndication, setSavingIndication] = useState<boolean>(false);
  const [indicationError, setIndicationError] = useState<string | null>(null);
  const [indicationSuccess, setIndicationSuccess] = useState<boolean>(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
    null
  );

  // Obtener el doctorId del localStorage al cargar el componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDoctorId = localStorage.getItem("doctorId");
      if (storedDoctorId) {
        setDoctorId(parseInt(storedDoctorId));
      }
    }
  }, []);

  // Load templates and person data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Fetching data for personId:", personId);

        // Fetch templates
        const templatesResponse: any = await httpRequest({
          url: "/medical-history-templates/my-templates",
          method: "GET",
          requiresAuth: true,
        });

        console.log("Templates response:", templatesResponse);

        if (templatesResponse) {
          console.log("Templates data:", templatesResponse);
          setTemplates(templatesResponse);
        } else {
          console.error("No templates data found in response");
        }

        // Fetch person data
        const personResponse: any = await httpRequest({
          url: `/person/${personId}`,
          method: "GET",
          requiresAuth: true,
        });

        console.log("Person response:", personResponse);

        if (personResponse) {
          console.log("Person data:", personResponse);
          setPerson(personResponse);
        } else {
          console.error("No person data found in response");
        }

        // Fetch medical history
        setLoadingHistory(true);
        const historyResponse: any = await httpRequest({
          url: `/medical-histories/person/${personId}`,
          method: "GET",
          requiresAuth: true,
        });

        console.log("Medical history response:", historyResponse);

        if (historyResponse) {
          console.log("Medical history data:", historyResponse);
          setMedicalHistory(historyResponse);

          // Si hay historias clínicas, seleccionar la primera para las indicaciones médicas
          if (historyResponse.length > 0) {
            setSelectedHistoryId(historyResponse[0].id);
          }
        } else {
          console.error("No medical history found in response");
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Error al cargar los datos");
      } finally {
        setLoading(false);
        setLoadingHistory(false);
      }
    };

    if (personId) {
      fetchData();
    } else {
      console.error("No personId provided");
      setError("ID de persona no proporcionado");
      setLoading(false);
    }
  }, [personId]);

  // Cargar indicaciones médicas cuando se selecciona una historia clínica
  useEffect(() => {
    if (activeTab === medicationsTabIndex && selectedHistoryId) {
      loadMedicalIndications(selectedHistoryId);
    }
  }, [activeTab, selectedHistoryId]);

  // Verificar si una plantilla tiene datos
  const hasTemplateData = (templateId: number): boolean => {
    return Object.keys(formValues).some(
      (key) =>
        key.startsWith(`${templateId}-`) &&
        formValues[key] !== "" &&
        formValues[key] !== null &&
        formValues[key] !== undefined
    );
  };

  // Obtener el número de plantillas con datos
  const getTemplatesWithDataCount = (): number => {
    return templates.filter((template) => hasTemplateData(template.id)).length;
  };

  // Handle form field change
  const handleFieldChange = (
    templateId: number,
    fieldId: number,
    value: any
  ) => {
    setFormValues({
      ...formValues,
      [`${templateId}-${fieldId}`]: value,
    });

    // Validate field
    validateField(templateId, fieldId, value);
  };

  // Validate a single field
  const validateField = (templateId: number, fieldId: number, value: any) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const field = template.fields.find((f) => f.id === fieldId);
    if (!field) return;

    const rules = parseValidationRules(field.validationRules);
    let error = "";

    if (rules.required && (!value || value === "")) {
      error = "Este campo es obligatorio";
    } else if (rules.min !== undefined && value < rules.min) {
      error = `El valor mínimo es ${rules.min}`;
    } else if (rules.max !== undefined && value > rules.max) {
      error = `El valor máximo es ${rules.max}`;
    } else if (
      rules.pattern &&
      typeof value === "string" &&
      !new RegExp(rules.pattern).test(value)
    ) {
      error = "El formato no es válido";
    }

    setFormErrors({
      ...formErrors,
      [`${templateId}-${fieldId}`]: error,
    });
  };

  // Validate form for a specific template
  const validateForm = (
    templateId: number,
    errorsObject?: Record<string, string>
  ): boolean => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return false;

    const newErrors: Record<string, string> = errorsObject || {};
    let isValid = true;

    template.fields.forEach((field) => {
      const key = `${templateId}-${field.id}`;
      const value = formValues[key];
      const rules = parseValidationRules(field.validationRules);

      if (rules.required && (!value || value === "")) {
        newErrors[key] = "Este campo es obligatorio";
        isValid = false;
      } else if (rules.min !== undefined && value < rules.min) {
        newErrors[key] = `El valor mínimo es ${rules.min}`;
        isValid = false;
      } else if (rules.max !== undefined && value > rules.max) {
        newErrors[key] = `El valor máximo es ${rules.max}`;
        isValid = false;
      } else if (
        rules.pattern &&
        typeof value === "string" &&
        !new RegExp(rules.pattern).test(value)
      ) {
        newErrors[key] = "El formato no es válido";
        isValid = false;
      }
    });

    if (!errorsObject) {
      setFormErrors(newErrors);
    }
    return isValid;
  };

  // Validate all forms with data
  const validateAllForms = (): {
    isValid: boolean;
    templatesWithErrors: number[];
  } => {
    const templatesWithErrors: number[] = [];
    let allValid = true;

    // Acumular todos los errores
    const combinedErrors: Record<string, string> = { ...formErrors };

    templates.forEach((template) => {
      if (hasTemplateData(template.id)) {
        // Solo validar plantillas con datos
        if (!validateForm(template.id, combinedErrors)) {
          allValid = false;
          templatesWithErrors.push(template.id);
        }
      }
    });

    // Actualizar todos los errores juntos
    setFormErrors(combinedErrors);
    return { isValid: allValid, templatesWithErrors };
  };

  // Función para dar acceso al médico a una historia clínica
  const grantAccessToDoctor = async (historyId: number) => {
    if (!doctorId) {
      console.error("No doctor ID available");
      return;
    }

    try {
      const accessData = {
        doctorId: doctorId,
        expiresAt: calculateExpiryDate(),
      };

      console.log(
        `Granting access for doctor ${doctorId} to history ${historyId}`
      );

      await httpRequest({
        url: `/medical-histories/${historyId}/access`,
        method: "POST",
        data: accessData,
        requiresAuth: true,
      });

      console.log(`Access granted for history ${historyId}`);
    } catch (err: any) {
      console.error(`Failed to grant access to history ${historyId}:`, err);
      // No lanzamos el error para que no afecte el flujo principal
    }
  };

  // Handle saving all templates with data
  const handleSaveAll = async (event: React.FormEvent) => {
    event.preventDefault();

    const templatesWithData = templates.filter((template) =>
      hasTemplateData(template.id)
    );

    if (templatesWithData.length === 0) {
      setError("No hay datos para guardar. Complete al menos un formulario.");
      return;
    }

    // Validar todas las plantillas con datos
    const validation = validateAllForms();

    if (!validation.isValid) {
      // Si hay errores, mostrar un mensaje y activar la pestaña con el primer error
      if (validation.templatesWithErrors.length > 0) {
        const firstTemplateWithError = validation.templatesWithErrors[0];
        const templateIndex = templates.findIndex(
          (t) => t.id === firstTemplateWithError
        );
        if (templateIndex >= 0) {
          setActiveTab(templateIndex);
        }
      }
      setError(
        "Por favor, corrija los errores en el formulario antes de guardar"
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Arreglos para rastrear el estado de cada plantilla
      const successfulTemplates: Template[] = [];
      const failedTemplates: Template[] = [];

      // Procesar las plantillas secuencialmente
      for (const template of templatesWithData) {
        try {
          // Crear un objeto para almacenar los datos del formulario
          const data: { [key: string]: any } = {};

          // Obtener valores de los campos para esta plantilla
          Object.keys(formValues)
            .filter(
              (key) =>
                key.startsWith(`${template.id}-`) &&
                formValues[key] !== "" &&
                formValues[key] !== null &&
                formValues[key] !== undefined
            )
            .forEach((key) => {
              // Extraer el ID del campo (después del guion)
              const fieldId = parseInt(key.split("-")[1]);

              // Encontrar el campo en la plantilla para obtener su nombre
              const field = template.fields.find((f) => f.id === fieldId);

              if (field) {
                // Almacenar el valor en el objeto data usando el nombre del campo como clave
                data[field.fieldName] = formValues[key];
              }
            });

          // Verificar si hay datos para enviar
          if (Object.keys(data).length === 0) continue;

          const medicalHistoryData = {
            personId: parseInt(personId),
            templateId: template.id,
            data: data,
          };

          console.log(
            `Sending data for template ${template.name}:`,
            medicalHistoryData
          );

          const response: any = await httpRequest({
            url: "/medical-histories",
            method: "POST",
            data: medicalHistoryData,
            requiresAuth: true,
          });

          console.log(`Response for template ${template.name}:`, response);

          // Si la respuesta incluye un ID de historia clínica, dar acceso al médico
          if (response && response.id) {
            await grantAccessToDoctor(response.id);

            // Si no hay historia seleccionada, seleccionar esta
            if (!selectedHistoryId) {
              setSelectedHistoryId(response.id);
            }
          }

          successfulTemplates.push(template);
        } catch (err: any) {
          console.error(`Error saving template ${template.name}:`, err);
          failedTemplates.push(template);
        }
      }

      // Mostrar mensaje adecuado según los resultados
      if (failedTemplates.length === 0) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);

        // Actualizar el historial médico después de guardar
        try {
          const historyResponse: any = await httpRequest({
            url: `/medical-histories/person/${personId}`,
            method: "GET",
            requiresAuth: true,
          });

          if (historyResponse) {
            setMedicalHistory(historyResponse);
          }
        } catch (err) {
          console.error("Error updating medical history after save:", err);
        }
      } else if (successfulTemplates.length === 0) {
        setError(
          "No se pudo guardar ninguna historia clínica. Por favor, intente nuevamente."
        );
      } else {
        setError(
          `Se guardaron ${successfulTemplates.length} plantillas, pero fallaron ${failedTemplates.length}. Verifique e intente nuevamente.`
        );
      }
    } catch (err: any) {
      console.error("Error in save process:", err);
      setError(err.message || "Error al guardar las historias clínicas");
    } finally {
      setSaving(false);
    }
  };

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // FUNCIONES DE INDICACIONES MÉDICAS

  // Buscar medicamentos
  const searchMedications = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setFilteredMedications([]);
      return;
    }

    setLoadingMedications(true);
    try {
      const response: any = await httpRequest({
        url: `/medications?search=${encodeURIComponent(searchTerm)}`,
        method: "GET",
        requiresAuth: true,
      });

      if (response) {
        setFilteredMedications(response);
      }
    } catch (err: any) {
      console.error("Error searching medications:", err);
    } finally {
      setLoadingMedications(false);
    }
  };

  // Cargar indicaciones médicas existentes
  const loadMedicalIndications = async (historyId: number) => {
    setLoadingIndications(true);
    try {
      const response: any = await httpRequest({
        url: `/medical-indications/by-history/${historyId}`,
        method: "GET",
        requiresAuth: true,
      });

      if (response) {
        setMedicalIndications(response);
      }
    } catch (err: any) {
      console.error("Error loading medical indications:", err);
    } finally {
      setLoadingIndications(false);
    }
  };

  // Crear una nueva indicación médica
  const createMedicalIndication = async () => {
    if (!selectedHistoryId) {
      setIndicationError("No hay una historia clínica seleccionada");
      return;
    }

    if (!selectedMedication && !indicationFormValues.medicationName) {
      setIndicationError("Debe seleccionar o ingresar un medicamento");
      return;
    }

    if (
      !indicationFormValues.dosageAmount ||
      !indicationFormValues.frequencyAmount
    ) {
      setIndicationError("Los campos de dosis y frecuencia son obligatorios");
      return;
    }

    setSavingIndication(true);
    setIndicationError(null);

    try {
      const payload = {
        medicalHistoryId: selectedHistoryId,
        medicationId: selectedMedication?.id,
        medicationName: !selectedMedication?.id
          ? indicationFormValues.medicationName
          : undefined,
        dosageAmount: parseFloat(indicationFormValues.dosageAmount),
        dosageUnit: indicationFormValues.dosageUnit,
        administrationRoute: indicationFormValues.administrationRoute,
        frequencyAmount: parseFloat(indicationFormValues.frequencyAmount),
        frequencyUnit: indicationFormValues.frequencyUnit,
        totalDuration: indicationFormValues.totalDuration
          ? parseFloat(indicationFormValues.totalDuration)
          : undefined,
        durationUnit: indicationFormValues.totalDuration
          ? indicationFormValues.durationUnit
          : undefined,
        specialInstructions:
          indicationFormValues.specialInstructions || undefined,
      };

      const response: any = await httpRequest({
        url: "/medical-indications",
        method: "POST",
        data: payload,
        requiresAuth: true,
      });

      if (response) {
        // Limpiar el formulario
        setIndicationFormValues({
          medicationId: null,
          medicationName: "",
          dosageAmount: "",
          dosageUnit: "mg",
          administrationRoute: "oral",
          frequencyAmount: "",
          frequencyUnit: "horas",
          totalDuration: "",
          durationUnit: "días",
          specialInstructions: "",
        });
        setSelectedMedication(null);
        setSearchMedication("");

        // Mostrar mensaje de éxito y recargar las indicaciones
        setIndicationSuccess(true);
        setTimeout(() => setIndicationSuccess(false), 3000);

        // Recargar las indicaciones médicas
        loadMedicalIndications(selectedHistoryId);
      }
    } catch (err: any) {
      console.error("Error creating medical indication:", err);
      setIndicationError(err.message || "Error al crear la indicación médica");
    } finally {
      setSavingIndication(false);
    }
  };

  // Discontinuar una indicación médica
  const discontinueIndication = async (indicationId: number) => {
    try {
      await httpRequest({
        url: `/medical-indications/${indicationId}/discontinue`,
        method: "PATCH",
        requiresAuth: true,
      });

      // Actualizar la lista de indicaciones
      const updatedIndications = medicalIndications.map((indication) => {
        if (indication.id === indicationId) {
          return { ...indication, status: "discontinued" };
        }
        return indication;
      });

      setMedicalIndications(updatedIndications);
    } catch (err: any) {
      console.error("Error discontinuing indication:", err);
      setIndicationError("Error al descontinuar la indicación");
    }
  };

  // Generar PDF
  // Generar PDF
  const generatePDF = () => {
    // Filtrar las indicaciones activas
    const activeIndications = medicalIndications.filter(
      (indication) => indication.status === "active"
    );

    if (activeIndications.length === 0) {
      setIndicationError("No hay indicaciones médicas activas para imprimir.");
      return;
    }

    const doc = new jsPDF("p", "mm", [210, 130]); // Tamaño de 13x21 cm
    const margin = 10; // Margen en mm
    const initialY = 50; // Espacio inicial desde arriba en mm
    const maxIndications = 3; // Máximo de indicaciones a imprimir

    // Espacio para las indicaciones
    let y = initialY; // Espacio inicial

    // Limitar a un máximo de 5 indicaciones
    const indicationsToPrint = activeIndications.slice(0, maxIndications);

    indicationsToPrint.forEach((indication, index) => {
      doc.setFontSize(12);
      doc.text(`Indicación ${index + 1}:`, margin, y);
      y += 5; // Espacio entre el título y el contenido

      doc.setFontSize(10);
      doc.text(`Medicamento: ${indication.medication.name}`, margin, y);
      y += 5;
      doc.text(
        `Dosis: ${indication.dosageAmount} ${indication.dosageUnit}`,
        margin,
        y
      );
      y += 5;
      doc.text(`Vía: ${indication.administrationRoute}`, margin, y);
      y += 5;
      doc.text(
        `Frecuencia: Cada ${indication.frequencyAmount} ${indication.frequencyUnit}`,
        margin,
        y
      );
      if (indication.totalDuration) {
        y += 5;
        doc.text(
          `Duración: ${indication.totalDuration} ${indication.durationUnit}`,
          margin,
          y
        );
      }
      if (indication.specialInstructions) {
        y += 5;
        doc.text(`Instrucciones: ${indication.specialInstructions}`, margin, y);
      }
      y += 10; // Espacio entre indicaciones
    });

    // Guardar el PDF
    doc.output('dataurlnewwindow');
  };

  // Render field based on data type
  const renderField = (templateId: number, field: TemplateField) => {
    const key = `${templateId}-${field.id}`;
    const value = formValues[key] || "";
    const error = formErrors[key] || "";
    const rules = parseValidationRules(field.validationRules);

    switch (field.dataType) {
      case FieldDataType.TEXTO:
        return (
          <TextField
            fullWidth
            type="text"
            label={field.fieldName}
            value={value}
            onChange={(e) =>
              handleFieldChange(templateId, field.id, e.target.value)
            }
            error={!!error}
            helperText={error}
            required={rules.required}
            variant="outlined"
          />
        );
      case FieldDataType.NUMERO:
        return (
          <TextField
            fullWidth
            type="number"
            label={field.fieldName}
            value={value}
            onChange={(e) =>
              handleFieldChange(templateId, field.id, e.target.value)
            }
            error={!!error}
            helperText={error}
            required={rules.required}
            inputProps={{
              min: rules.min,
              max: rules.max,
            }}
            variant="outlined"
          />
        );
      case FieldDataType.LISTA:
        const options = field.listOptions ? field.listOptions.split(",") : [];
        return (
          <FormControl fullWidth error={!!error} required={rules.required}>
            <InputLabel>{field.fieldName}</InputLabel>
            <Select
              value={value}
              onChange={(e) =>
                handleFieldChange(templateId, field.id, e.target.value)
              }
              label={field.fieldName}
            >
              {options.map((option, index) => (
                <MenuItem key={index} value={option.trim()}>
                  {option.trim()}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );
      case FieldDataType.FECHA:
        return (
          <TextField
            fullWidth
            type="date"
            label={field.fieldName}
            value={value}
            onChange={(e) =>
              handleFieldChange(templateId, field.id, e.target.value)
            }
            error={!!error}
            helperText={error}
            required={rules.required}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
          />
        );
      case FieldDataType.BOOLEANO:
        return (
          <FormControl fullWidth error={!!error} required={rules.required}>
            <InputLabel>{field.fieldName}</InputLabel>
            <Select
              value={value}
              onChange={(e) =>
                handleFieldChange(templateId, field.id, e.target.value)
              }
              label={field.fieldName}
            >
              <MenuItem value="true">Sí</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );
      case FieldDataType.TEXTO_LARGO:
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.fieldName}
            value={value}
            onChange={(e) =>
              handleFieldChange(templateId, field.id, e.target.value)
            }
            error={!!error}
            helperText={error}
            required={rules.required}
            variant="outlined"
          />
        );
      case FieldDataType.MULTIPLE:
        const multiOptions = field.listOptions
          ? field.listOptions.split(",")
          : [];
        return (
          <FormControl fullWidth error={!!error} required={rules.required}>
            <InputLabel>{field.fieldName}</InputLabel>
            <Select
              multiple
              value={value || []}
              onChange={(e) =>
                handleFieldChange(templateId, field.id, e.target.value)
              }
              renderValue={(selected) =>
                Array.isArray(selected) ? selected.join(", ") : selected
              }
              label={field.fieldName}
            >
              {multiOptions.map((option, index) => (
                <MenuItem key={index} value={option.trim()}>
                  <Checkbox
                    checked={
                      Array.isArray(value)
                        ? value.indexOf(option.trim()) > -1
                        : false
                    }
                  />
                  <ListItemText primary={option.trim()} />
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );
      default:
        return (
          <TextField
            fullWidth
            label={field.fieldName}
            value={value}
            onChange={(e) =>
              handleFieldChange(templateId, field.id, e.target.value)
            }
            error={!!error}
            helperText={error}
            required={rules.required}
            variant="outlined"
          />
        );
    }
  };

  // Define índices para las pestañas
  const medicationsTabIndex = templates.length; // Indicaciones médicas va antes del historial
  const historyTabIndex = templates.length + 1; // El historial ahora será la última pestaña
  const showMedicationsTab = activeTab === medicationsTabIndex;
  const showHistoryTab = activeTab === historyTabIndex;

  // Component rendering
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  const hasData = getTemplatesWithDataCount() > 0;

  return (
    <DashboardCard
      title="Historia Clínica"
      action={
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => router.back()}
        >
          Volver
        </Button>
      }
    >
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon fontSize="inherit" />}
            sx={{ mb: 3 }}
          >
            Historia clínica guardada exitosamente
          </Alert>
        )}

        {/* Patient Info Card */}
        {person ? (
          <PatientInfoCard>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon color="primary" />
                  <Typography variant="h5">Información del Paciente</Typography>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nombre Completo:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {person.firstName || "N/A"} {person.lastName || ""}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cédula:
                  </Typography>
                  <Typography variant="body1">
                    {person.identityCard
                      ? formatIdentityCard(person.identityCard)
                      : "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Género:
                  </Typography>
                  <Typography variant="body1">
                    {person.gender == 'M' ? 'Masculino' : 'Femenino'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Edad:
                  </Typography>
                  <Typography variant="body1">
                    {calculateAge(person.birthday)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Nacimiento:
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(person.birthday)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Teléfono:
                  </Typography>
                  <Typography variant="body1">
                    {person.contact?.phoneNumbers &&
                    person.contact.phoneNumbers.length > 0
                      ? formatPhoneNumber(
                          person.contact.phoneNumbers[0].phoneNumber
                        )
                      : "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </PatientInfoCard>
        ) : null}

        <form onSubmit={handleSaveAll}>
          {/* Tabs for templates and history */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {templates.map((template, index) => (
                <Tab
                  key={template.id}
                  label={template.name}
                  icon={
                    hasTemplateData(template.id) ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : undefined
                  }
                  iconPosition="end"
                />
              ))}
              <Tab
                label="Indicaciones Médicas"
                icon={<MedicationIcon />}
                iconPosition="start"
              />
              <Tab
                label="Historial"
                icon={<HistoryIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Template forms */}
          {templates.map((template, index) => (
            <div key={template.id} role="tabpanel" hidden={activeTab !== index}>
              {activeTab === index && (
                <StyledPaper elevation={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <DocumentIcon color="primary" />
                    <Typography variant="h6">{template.name}</Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {template.fields
                      .filter((field) => field.isActive)
                      .sort((a, b) => a.fieldOrder - b.fieldOrder)
                      .map((field) => (
                        <Grid item xs={12} sm={6} md={4} key={field.id}>
                          <FormField>
                            {renderField(template.id, field)}
                          </FormField>
                        </Grid>
                      ))}
                  </Grid>
                </StyledPaper>
              )}
            </div>
          ))}

          {/* Medical Indications tab */}
          {showMedicationsTab && (
            <StyledPaper elevation={3}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <MedicationIcon color="primary" />
                <Typography variant="h6">Indicaciones Médicas</Typography>
              </Box>

              {medicalHistory.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Para crear indicaciones médicas, primero debe guardar al menos
                  una historia clínica.
                </Alert>
              ) : (
                <>
                  {/* Selector de historia clínica */}
                  <Card variant="outlined" sx={{ mb: 4 }}>
                    <CardHeader title="Seleccione Historia Clínica" />
                    <CardContent>
                      <FormControl fullWidth>
                        <InputLabel id="history-select-label">
                          Historia Clínica
                        </InputLabel>
                        <Select
                          labelId="history-select-label"
                          value={selectedHistoryId || ""}
                          onChange={(e) => {
                            const newHistoryId: any = e.target.value;
                            setSelectedHistoryId(newHistoryId);
                            if (newHistoryId) {
                              loadMedicalIndications(newHistoryId);
                            }
                          }}
                          label="Historia Clínica"
                        >
                          {medicalHistory.map((history) => (
                            <MenuItem key={history.id} value={history.id}>
                              {history.template.name} -{" "}
                              {formatDate(history.createdAt)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {selectedHistoryId && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          Historia clínica seleccionada. Puede crear
                          indicaciones médicas.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Formulario para crear una nueva indicación médica */}
                  <Card variant="outlined" sx={{ mb: 4 }}>
                    <CardHeader title="Nueva Prescripción" />
                    <Divider />
                    <CardContent>
                      {indicationError && (
                        <Alert
                          severity="error"
                          sx={{ mb: 3 }}
                          onClose={() => setIndicationError(null)}
                        >
                          {indicationError}
                        </Alert>
                      )}
                      {indicationSuccess && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                          Indicación médica creada con éxito
                        </Alert>
                      )}

                      <Grid container spacing={3}>
                        {/* Búsqueda de medicamento */}
                        <Grid item xs={12} md={6}>
                          <Autocomplete
                            id="medication-search"
                            options={filteredMedications}
                            getOptionLabel={(option) => option.name}
                            loading={loadingMedications}
                            value={selectedMedication}
                            onChange={(_, newValue) => {
                              setSelectedMedication(newValue);
                              if (newValue) {
                                setIndicationFormValues({
                                  ...indicationFormValues,
                                  medicationId: newValue.id,
                                  medicationName: "",
                                });
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Buscar medicamento"
                                variant="outlined"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSearchMedication(value);
                                  searchMedications(value);
                                }}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {loadingMedications ? (
                                        <CircularProgress
                                          color="inherit"
                                          size={20}
                                        />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            noOptionsText="No se encontraron medicamentos"
                            loadingText="Buscando..."
                          />
                        </Grid>

                        {/* Ingresar nombre de medicamento nuevo */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="O ingrese nombre del medicamento nuevo"
                            value={indicationFormValues.medicationName}
                            onChange={(e) => {
                              setIndicationFormValues({
                                ...indicationFormValues,
                                medicationName: e.target.value,
                              });
                              setSelectedMedication(null);
                            }}
                            disabled={!!selectedMedication}
                            helperText="Si el medicamento no existe, se creará automáticamente"
                          />
                        </Grid>

                        {/* Dosis */}
                        <Grid item xs={6} md={3}>
                          <TextField
                            fullWidth
                            label="Dosis"
                            type="number"
                            value={indicationFormValues.dosageAmount}
                            onChange={(e) =>
                              setIndicationFormValues({
                                ...indicationFormValues,
                                dosageAmount: e.target.value,
                              })
                            }
                            required
                          />
                        </Grid>

                        {/* Unidad de dosis */}
                        <Grid item xs={6} md={3}>
                          <FormControl fullWidth>
                            <InputLabel>Unidad</InputLabel>
                            <Select
                              value={indicationFormValues.dosageUnit}
                              onChange={(e) =>
                                setIndicationFormValues({
                                  ...indicationFormValues,
                                  dosageUnit: e.target.value,
                                })
                              }
                              label="Unidad"
                            >
                              <MenuItem value="mg">mg</MenuItem>
                              <MenuItem value="g">g</MenuItem>
                              <MenuItem value="ml">ml</MenuItem>
                              <MenuItem value="gotas">gotas</MenuItem>
                              <MenuItem value="tabletas">tabletas</MenuItem>
                              <MenuItem value="cápsulas">cápsulas</MenuItem>
                              <MenuItem value="amp">ampolla</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Vía de administración */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Vía de administración</InputLabel>
                            <Select
                              value={indicationFormValues.administrationRoute}
                              onChange={(e) =>
                                setIndicationFormValues({
                                  ...indicationFormValues,
                                  administrationRoute: e.target.value,
                                })
                              }
                              label="Vía de administración"
                            >
                              <MenuItem value="oral">Oral</MenuItem>
                              <MenuItem value="sublingual">Sublingual</MenuItem>
                              <MenuItem value="intravenosa">
                                Intravenosa
                              </MenuItem>
                              <MenuItem value="intramuscular">
                                Intramuscular
                              </MenuItem>
                              <MenuItem value="subcutánea">Subcutánea</MenuItem>
                              <MenuItem value="inhalatoria">
                                Inhalatoria
                              </MenuItem>
                              <MenuItem value="tópica">Tópica</MenuItem>
                              <MenuItem value="rectal">Rectal</MenuItem>
                              <MenuItem value="oftálmica">Oftálmica</MenuItem>
                              <MenuItem value="ótica">Ótica</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Frecuencia */}
                        <Grid item xs={6} md={3}>
                          <TextField
                            fullWidth
                            label="Frecuencia"
                            type="number"
                            value={indicationFormValues.frequencyAmount}
                            onChange={(e) =>
                              setIndicationFormValues({
                                ...indicationFormValues,
                                frequencyAmount: e.target.value,
                              })
                            }
                            required
                          />
                        </Grid>

                        {/* Unidad de frecuencia */}
                        <Grid item xs={6} md={3}>
                          <FormControl fullWidth>
                            <InputLabel>Unidad</InputLabel>
                            <Select
                              value={indicationFormValues.frequencyUnit}
                              onChange={(e) =>
                                setIndicationFormValues({
                                  ...indicationFormValues,
                                  frequencyUnit: e.target.value,
                                })
                              }
                              label="Unidad"
                            >
                              <MenuItem value="horas">Horas</MenuItem>
                              <MenuItem value="días">Días</MenuItem>
                              <MenuItem value="semanas">Semanas</MenuItem>
                              <MenuItem value="veces al día">
                                Veces al día
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Duración */}
                        <Grid item xs={6} md={3}>
                          <TextField
                            fullWidth
                            label="Duración"
                            type="number"
                            value={indicationFormValues.totalDuration}
                            onChange={(e) =>
                              setIndicationFormValues({
                                ...indicationFormValues,
                                totalDuration: e.target.value,
                              })
                            }
                          />
                        </Grid>

                        {/* Unidad de duración */}
                        <Grid item xs={6} md={3}>
                          <FormControl fullWidth>
                            <InputLabel>Unidad</InputLabel>
                            <Select
                              value={indicationFormValues.durationUnit}
                              onChange={(e) =>
                                setIndicationFormValues({
                                  ...indicationFormValues,
                                  durationUnit: e.target.value,
                                })
                              }
                              label="Unidad"
                              disabled={!indicationFormValues.totalDuration}
                            >
                              <MenuItem value="días">Días</MenuItem>
                              <MenuItem value="semanas">Semanas</MenuItem>
                              <MenuItem value="meses">Meses</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Instrucciones especiales */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Instrucciones especiales"
                            value={indicationFormValues.specialInstructions}
                            onChange={(e) =>
                              setIndicationFormValues({
                                ...indicationFormValues,
                                specialInstructions: e.target.value,
                              })
                            }
                          />
                        </Grid>
                      </Grid>

                      <Box display="flex" justifyContent="flex-end" mt={3}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={
                            savingIndication ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <AddIcon />
                            )
                          }
                          onClick={() => createMedicalIndication()}
                          disabled={savingIndication}
                        >
                          {savingIndication
                            ? "Guardando..."
                            : "Agregar Indicación Médica"}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Lista de indicaciones médicas existentes */}
                  <Box>
                    <Typography variant="h6" mb={2}>
                      Indicaciones Médicas Actuales
                    </Typography>

                    {loadingIndications ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                      </Box>
                    ) : medicalIndications.length > 0 ? (
                      <Grid container spacing={2}>
                        {medicalIndications.map((indication) => (
                          <Grid item xs={12} md={6} lg={4} key={indication.id}>
                            <Card
                              variant="outlined"
                              sx={{
                                position: "relative",
                                opacity:
                                  indication.status === "discontinued"
                                    ? 0.7
                                    : 1,
                              }}
                            >
                              <CardHeader
                                title={indication.medication.name}
                                subheader={
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {formatDate(indication.createdAt)}
                                    {indication.status === "discontinued" && (
                                      <Chip
                                        size="small"
                                        label="Discontinuado"
                                        color="error"
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </Typography>
                                }
                              />
                              <Divider />
                              <CardContent>
                                <Typography variant="body1" mb={1}>
                                  <strong>Dosis:</strong>{" "}
                                  {indication.dosageAmount}{" "}
                                  {indication.dosageUnit}
                                </Typography>
                                <Typography variant="body1" mb={1}>
                                  <strong>Vía:</strong>{" "}
                                  {indication.administrationRoute}
                                </Typography>
                                <Typography variant="body1" mb={1}>
                                  <strong>Frecuencia:</strong> Cada{" "}
                                  {indication.frequencyAmount}{" "}
                                  {indication.frequencyUnit}
                                </Typography>
                                {indication.totalDuration && (
                                  <Typography variant="body1" mb={1}>
                                    <strong>Duración:</strong>{" "}
                                    {indication.totalDuration}{" "}
                                    {indication.durationUnit}
                                  </Typography>
                                )}
                                {indication.specialInstructions && (
                                  <Typography variant="body1" mb={0}>
                                    <strong>Instrucciones:</strong>{" "}
                                    {indication.specialInstructions}
                                  </Typography>
                                )}
                              </CardContent>
                              {indication.status === "active" && (
                                <CardActions>
                                  <Button
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      discontinueIndication(indication.id)
                                    }
                                    startIcon={<CancelIcon />}
                                  >
                                    Discontinuar
                                  </Button>
                                </CardActions>
                              )}
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Alert severity="info">
                        No hay indicaciones médicas registradas para este
                        paciente.
                      </Alert>
                    )}

                    {medicalIndications.length > 0 ? (
                                            <Box display="flex" justifyContent="flex-end" mt={3}>
                                            <Button
                                              variant="contained"
                                              color="primary"
                                              onClick={generatePDF}
                                              disabled={medicalIndications.length === 0}
                                            >
                                              Generar PDF de Indicaciones
                                            </Button>
                                          </Box>
                    ) : (
                        <></>
                    )}
                  </Box>
                </>
              )}
            </StyledPaper>
          )}

          {/* History tab */}
          {showHistoryTab && (
            <StyledPaper elevation={3}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <EventNoteIcon color="primary" />
                <Typography variant="h6">
                  Historial Clínico del Paciente
                </Typography>
              </Box>

              <Box mb={3}>
                <Chip
                  label="Consultas Anteriores"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />

                {loadingHistory ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress size={30} />
                  </Box>
                ) : medicalHistory.length > 0 ? (
                  medicalHistory.map((history) => (
                    <StyledAccordion key={history.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            alignItems: "center",
                          }}
                        >
                          <Typography fontWeight={500}>
                            {history.template.name} -{" "}
                            {formatDate(history.createdAt)}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          {Object.entries(history.data).map(
                            ([fieldName, value]) => (
                              <Grid item xs={12} sm={6} md={4} key={fieldName}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                >
                                  {fieldName}:
                                </Typography>
                                <Typography variant="body1">
                                  {String(value)}
                                </Typography>
                              </Grid>
                            )
                          )}
                        </Grid>
                      </AccordionDetails>
                    </StyledAccordion>
                  ))
                ) : (
                  <Alert severity="info">
                    Este paciente no cuenta con historias clínicas previas.
                  </Alert>
                )}
              </Box>
            </StyledPaper>
          )}

          {/* Global Save Button - Only show if not on history tab and not on medications tab */}
          {!showHistoryTab && !showMedicationsTab && (
            <Box sx={{ position: "sticky", bottom: 16, zIndex: 10, mt: 3 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "background.default",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {hasData ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                          {getTemplatesWithDataCount()}{" "}
                          {getTemplatesWithDataCount() === 1
                            ? "plantilla completada"
                            : "plantillas completadas"}
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            color: "text.secondary",
                          }}
                        >
                          <MedicalInformationIcon sx={{ mr: 1 }} />
                          Complete al menos una plantilla para guardar
                        </Box>
                      )}
                    </Typography>
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SaveIcon />}
                    disabled={saving || !hasData}
                  >
                    {saving ? "Guardando..." : "Guardar Historia Clínica"}
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}
        </form>
      </Box>
    </DashboardCard>
  );
}

export const dynamic = "force-dynamic";
