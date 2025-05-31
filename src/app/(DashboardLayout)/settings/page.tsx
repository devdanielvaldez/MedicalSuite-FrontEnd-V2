"use client";
import React, { useState, useEffect } from "react";
import { 
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Paper,
  InputAdornment,
  IconButton
} from "@mui/material";
import { httpRequest } from "@/app/utils/http";
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface DoctorData {
  doctorId: number;
  execuatur: string | null;
  logoUrl: string | null;
  person: {
    firstName: string;
    lastName: string;
    identityCard: string;
  };
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DoctorSettings() {
  const [tabValue, setTabValue] = useState(0);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    execuatur: "",
    logo: null as File | null,
    previewLogo: ""
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const doctorId = localStorage.getItem("doctorId"); // Asegúrate de tener este valor
        const response: any = await httpRequest({
          url: `/doctor/by-id?doctorId=${doctorId}`,
          method: "GET",
          requiresAuth: true,
        });
        
        setDoctorData(response);
        setFormState(prev => ({
          ...prev,
          execuatur: response.execuatur || ""
        }));
      } catch (err: any) {
        setError(err.message || "Error al cargar datos del médico");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setFormState(prev => ({
          ...prev,
          logo: file,
          previewLogo: reader.result as string
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage("");

      const formData = new FormData();
      if (formState.execuatur) formData.append("execuatur", formState.execuatur);
      if (formState.logo) formData.append("logo", formState.logo);

      await httpRequest({
        url: `/doctor/update-doctor/${doctorData?.doctorId}`,
        method: "PATCH",
        data: {
          execuatur: formState.execuatur,
          logoUrl: formState.previewLogo
        },
        requiresAuth: true,
      });

      setSuccessMessage("Datos actualizados correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Error al actualizar los datos");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
        <Tab label="Datos Públicos" />
        {/* Agrega más tabs aquí si es necesario */}
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Información Pública del Médico
        </Typography>

        {doctorData && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                src={formState.previewLogo || doctorData.logoUrl || ""}
                sx={{ width: 100, height: 100, mr: 3 }}
              >
                <ImageIcon fontSize="large" />
              </Avatar>
              
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="logo-upload">
                  <Button 
                    variant="outlined" 
                    component="span"
                    startIcon={<ImageIcon />}
                  >
                    {formState.logo ? "Cambiar Logo" : "Subir Logo"}
                  </Button>
                </label>
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Formatos soportados: JPG, PNG. Tamaño máximo: 2MB
                </Typography>
              </Box>
            </Box>

            <TextField
              label="Nombre Completo"
              value={`${doctorData.person.firstName} ${doctorData.person.lastName}`}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Cédula"
              value={doctorData.person.identityCard}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Exequatur"
              value={formState.execuatur}
              onChange={(e) => setFormState(prev => ({ ...prev, execuatur: e.target.value }))}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end">
                      <CheckCircleIcon color="success" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}
              >
                Guardar Cambios
              </Button>
            </Box>
          </Box>
        )}
      </TabPanel>
    </Paper>
  );
}