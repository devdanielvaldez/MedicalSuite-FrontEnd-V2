'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { httpRequest } from '@/app/utils/http';

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

interface RegisterBranchOfficeDialogProps {
  open: boolean;
  onClose: () => void;
}

const RegisterBranchOfficeDialog: React.FC<RegisterBranchOfficeDialogProps> = ({
  open,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    nameBranchOffice: '',
    branchOfficeDoctorId: '',
    phoneNumber: '',
    typePhone: 'cellphone', // valor por defecto
    label: '',
    country: 'DO',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const payload = {
      nameBranchOffice: formData.nameBranchOffice,
      branchOfficeDoctorId: Number(formData.branchOfficeDoctorId),
      createOrUpdateContactDto: {
        phoneNumbers: [
          {
            phoneNumber: formData.phoneNumber,
            typePhone: formData.typePhone,
            label: formData.label,
            country: formData.country,
          },
        ],
        socialNetworks: [],
      },
    };

    httpRequest({
      method: 'POST',
      url: '/branch-office', // Ajusta la URL de tu API según corresponda
      data: payload,
    })
      .then((res: any) => {
        console.log('Consultorio registrado', res);
        onClose();
        // Reinicia el formulario si es necesario
        setFormData({
          nameBranchOffice: '',
          branchOfficeDoctorId: '',
          phoneNumber: '',
          typePhone: 'cellphone',
          label: '',
          country: 'DO',
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar Consultorio</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <CustomTextField
            label="Nombre del Consultorio"
            name="nameBranchOffice"
            value={formData.nameBranchOffice}
            onChange={handleChange}
            fullWidth
          />
          <CustomTextField
            label="ID del Doctor"
            name="branchOfficeDoctorId"
            type="number"
            value={formData.branchOfficeDoctorId}
            onChange={handleChange}
            fullWidth
          />
          <CustomTextField
            label="Número de Teléfono"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            fullWidth
          />
          <CustomTextField
            label="Tipo de Teléfono"
            name="typePhone"
            value={formData.typePhone}
            onChange={handleChange}
            select
            fullWidth
          >
            <MenuItem value="cellphone">Cellphone</MenuItem>
            <MenuItem value="landline">Landline</MenuItem>
          </CustomTextField>
          <CustomTextField
            label="Etiqueta"
            name="label"
            value={formData.label}
            onChange={handleChange}
            fullWidth
          />
          <CustomTextField
            label="País"
            name="country"
            value={formData.country}
            onChange={handleChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterBranchOfficeDialog;