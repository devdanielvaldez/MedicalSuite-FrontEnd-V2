'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  IconButton,
  Typography,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { httpRequest } from '@/app/utils/http';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

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

// Interfaz para un contacto
interface Contact {
  phoneNumber: string;
  typePhone: string;
  label: string;
  country: string;
}

// Estado del formulario (para registrar)
interface FormData {
  nameBranchOffice: string;
  contacts: Contact[];
}

// Interfaz para datos de edición
export interface BranchOfficeEditData {
  branchOfficeId: number;
  uuid: string; // uuid del consultorio
  nameBranchOffice: string;
  createOrUpdateContactDto: {
    uuid: string; // uuid del objeto de contacto
    phoneNumbers: Contact[];
    socialNetworks: any[];
  };
}

interface RegisterBranchOfficeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (newBranch: any) => void;
  editData?: BranchOfficeEditData;
}

const RegisterBranchOfficeDialog: React.FC<RegisterBranchOfficeDialogProps> = ({
  open,
  onClose,
  onSave,
  editData,
}) => {
  const [formData, setFormData] = useState<FormData>({
    nameBranchOffice: '',
    contacts: [{ phoneNumber: '', typePhone: 'cellphone', label: 'TEL_OFFICE', country: 'DO' }],
  });

  const [isSaving, setIsSaving] = useState(false);

  // Si editData cambia (modo edición) o se abre el diálogo, inicializamos el formulario
  useEffect(() => {
    if (editData) {
      setFormData({
        nameBranchOffice: editData.nameBranchOffice,
        contacts:
          editData.createOrUpdateContactDto.phoneNumbers.length > 0
            ? editData.createOrUpdateContactDto.phoneNumbers
            : [{ phoneNumber: '', typePhone: 'cellphone', label: 'TEL_OFFICE', country: 'DO' }],
      });
    } else {
      setFormData({
        nameBranchOffice: '',
        contacts: [{ phoneNumber: '', typePhone: 'cellphone', label: 'TEL_OFFICE', country: 'DO' }],
      });
    }
  }, [editData, open]);

  // Manejo de cambios en los campos generales
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejo de cambios en un contacto específico
  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    setFormData((prev) => {
      const updatedContacts = [...prev.contacts];
      updatedContacts[index] = { ...updatedContacts[index], [field]: value };
      return { ...prev, contacts: updatedContacts };
    });
  };

  // Agregar un nuevo contacto
  const handleAddContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        { phoneNumber: '', typePhone: 'cellphone', label: 'TEL_OFFICE', country: 'DO' },
      ],
    }));
  };

  // Eliminar un contacto (si hay más de uno)
  const handleRemoveContact = (index: number) => {
    setFormData((prev) => {
      const updatedContacts = prev.contacts.filter((_, i) => i !== index);
      return { ...prev, contacts: updatedContacts };
    });
  };

  // Valida que todos los campos estén llenos
  const isFormValid = (): boolean => {
    if (!formData.nameBranchOffice.trim()) return false;
    // Solo validamos contactos si NO estamos en modo edición
    if (!editData) {
      for (const contact of formData.contacts) {
        if (
          !contact.phoneNumber.trim() ||
          !contact.typePhone.trim() ||
          !contact.label.trim() ||
          !contact.country.trim()
        ) {
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    setIsSaving(true);

    if (editData) {
      // Modo edición: hacemos PATCH
      const payload = {
        uuid: editData.uuid,
        nameBranchOffice: formData.nameBranchOffice
      };

      httpRequest({
        method: 'POST',
        url: `/branch-office`,
        data: payload,
        requiresAuth: true
      })
        .then((res: any) => {
          console.log('Consultorio editado', res);
          onClose();
          if (onSave) onSave(res);
        })
        .catch((err) => {
          console.error(err);
          alert("Ocurrió un error al editar el consultorio.");
        })
        .finally(() => {
          setIsSaving(false);
        });
    } else {
      // Modo registro: hacemos POST
      const payload = {
        nameBranchOffice: formData.nameBranchOffice,
        contactDto: {
          phoneNumbers: formData.contacts,
          socialNetworks: [],
        },
      };

      httpRequest({
        method: 'POST',
        url: '/branch-office',
        data: payload,
        requiresAuth: true
      })
        .then((res: any) => {
          console.log('Consultorio registrado', res);
          onClose();
          if (onSave) onSave(res);
          setFormData({
            nameBranchOffice: '',
            contacts: [{ phoneNumber: '', typePhone: 'cellphone', label: 'TEL_OFFICE', country: 'DO' }],
          });
        })
        .catch((err) => {
          console.error(err);
          alert("Ocurrió un error al registrar el consultorio.");
        })
        .finally(() => {
          setIsSaving(false);
        });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? "Editar Consultorio" : "Registrar Consultorio"}</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <CustomTextField
            label="Nombre del Consultorio"
            name="nameBranchOffice"
            value={formData.nameBranchOffice}
            onChange={handleChange}
            fullWidth
          />

          {/* Sección para contactos */}
          {!editData && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Contactos
              </Typography>
              {formData.contacts.map((contact, index) => (
                <Box key={index} display="flex" gap={2} alignItems="center" mb={2}>
                  <CustomTextField
                    label="Número de Teléfono"
                    value={contact.phoneNumber}
                    onChange={(e) => handleContactChange(index, 'phoneNumber', e.target.value)}
                    fullWidth
                  />
                  <CustomTextField
                    label="Tipo de Teléfono"
                    value={contact.typePhone}
                    onChange={(e) => handleContactChange(index, 'typePhone', e.target.value)}
                    select
                    fullWidth
                  >
                    <MenuItem value="cellphone">Celular</MenuItem>
                    <MenuItem value="landline">Teléfono Fijo</MenuItem>
                  </CustomTextField>
                  {formData.contacts.length > 1 && (
                    <IconButton onClick={() => handleRemoveContact(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button variant="outlined" onClick={handleAddContact} startIcon={<AddIcon />}>
                Agregar contacto
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} color="inherit" /> : (editData ? 'Editar' : 'Registrar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterBranchOfficeDialog;