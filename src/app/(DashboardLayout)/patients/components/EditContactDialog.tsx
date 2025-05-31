import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { httpRequest } from "@/app/utils/http";
import { toast } from "react-toastify";

interface PhoneNumber {
  phoneNumber: string;
  typePhone: string;
  label: string;
  country: string;
}

interface SocialNetwork {
  perfilSocial: string;
  label: string;
}

interface EditContactDialogProps {
  open: boolean;
  onClose: () => void;
  contact: {
    contactId: number;
    uuid: string;
    phoneNumbers: PhoneNumber[];
    socialNetworks: SocialNetwork[];
  } | null;
  patientName: string; // Nombre del paciente para mostrarlo en el título
}

const EditContactDialog = ({
  open,
  onClose,
  contact,
  patientName,
}: EditContactDialogProps) => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Inicializar los estados cuando se abre el modal
    if (contact) {
      setPhoneNumbers(contact.phoneNumbers || []);
      setSocialNetworks(contact.socialNetworks || []);
    } else {
      // Valores por defecto si no hay contacto
      setPhoneNumbers([]);
      setSocialNetworks([]);
    }
  }, [contact, open]);

  const handleAddPhone = () => {
    setPhoneNumbers([
      ...phoneNumbers,
      { phoneNumber: "", typePhone: "cellphone", label: "Home", country: "DO" },
    ]);
  };

  const handleRemovePhone = (index: number) => {
    const updatedPhones = [...phoneNumbers];
    updatedPhones.splice(index, 1);
    setPhoneNumbers(updatedPhones);
  };

  const handlePhoneChange = (index: number, field: keyof PhoneNumber, value: string) => {
    const updatedPhones = [...phoneNumbers];
    updatedPhones[index] = { ...updatedPhones[index], [field]: value };
    setPhoneNumbers(updatedPhones);
  };

  const handleAddSocialNetwork = () => {
    setSocialNetworks([...socialNetworks, { perfilSocial: "", label: "Instagram" }]);
  };

  const handleRemoveSocialNetwork = (index: number) => {
    const updatedNetworks = [...socialNetworks];
    updatedNetworks.splice(index, 1);
    setSocialNetworks(updatedNetworks);
  };

  const handleSocialNetworkChange = (
    index: number,
    field: keyof SocialNetwork,
    value: string
  ) => {
    const updatedNetworks = [...socialNetworks];
    updatedNetworks[index] = { ...updatedNetworks[index], [field]: value };
    setSocialNetworks(updatedNetworks);
  };

  const handleSave = async () => {
    if (!contact?.uuid) {
      toast.error("No se pudo identificar el contacto a editar");
      return;
    }

    setIsLoading(true);

    try {
      await httpRequest({
        method: "PATCH",
        url: `/contact/${contact.contactId}`,
        data: {
          phoneNumbers,
          socialNetworks,
        },
        requiresAuth: true,
      });

      toast.success("Contactos actualizados correctamente");
      onClose();
    } catch (error) {
      console.error("Error al actualizar contactos:", error);
      toast.error("Error al actualizar los contactos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Editar contactos de {patientName}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Números de teléfono
          </Typography>
          {phoneNumbers.map((phone, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Número de teléfono"
                    value={phone.phoneNumber}
                    onChange={(e) => handlePhoneChange(index, "phoneNumber", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      label="Tipo"
                      value={phone.typePhone}
                      onChange={(e) => handlePhoneChange(index, "typePhone", e.target.value)}
                    >
                      <MenuItem value="cellphone">Celular</MenuItem>
                      <MenuItem value="telephone">Fijo</MenuItem>
                      <MenuItem value="work">Trabajo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Etiqueta</InputLabel>
                    <Select
                      label="Etiqueta"
                      value={phone.label}
                      onChange={(e) => handlePhoneChange(index, "label", e.target.value)}
                    >
                      <MenuItem value="Home">Casa</MenuItem>
                      <MenuItem value="Work">Trabajo</MenuItem>
                      <MenuItem value="Other">Otro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>País</InputLabel>
                    <Select
                      label="País"
                      value={phone.country}
                      onChange={(e) => handlePhoneChange(index, "country", e.target.value)}
                    >
                      <MenuItem value="DO">República Dominicana</MenuItem>
                      <MenuItem value="US">Estados Unidos</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <IconButton 
                color="error" 
                onClick={() => handleRemovePhone(index)}
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddPhone}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Añadir número
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Redes Sociales
          </Typography>
          {socialNetworks.map((network, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Perfil"
                    value={network.perfilSocial}
                    onChange={(e) =>
                      handleSocialNetworkChange(index, "perfilSocial", e.target.value)
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth>
                    <InputLabel>Red social</InputLabel>
                    <Select
                      label="Red social"
                      value={network.label}
                      onChange={(e) =>
                        handleSocialNetworkChange(index, "label", e.target.value)
                      }
                    >
                      <MenuItem value="Instagram">Instagram</MenuItem>
                      <MenuItem value="Twitter">Twitter/X</MenuItem>
                      <MenuItem value="Facebook">Facebook</MenuItem>
                      <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                      <MenuItem value="TikTok">TikTok</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <IconButton 
                color="error" 
                onClick={() => handleRemoveSocialNetwork(index)}
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddSocialNetwork}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Añadir red social
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditContactDialog;