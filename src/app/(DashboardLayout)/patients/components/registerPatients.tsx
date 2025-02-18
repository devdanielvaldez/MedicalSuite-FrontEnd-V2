'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    FormControl,
    InputLabel,
    FormControlLabel,
    Checkbox,
    Radio,
    RadioGroup,
    FormLabel,
    Stepper,
    Step,
    StepLabel,
    Slide,
    Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import PersonIcon from '@mui/icons-material/Person';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import { provincias } from '@/app/data/provincias';
import { municipios } from '@/app/data/municipios';
import { httpRequest } from '@/app/utils/http';

interface RegisterPatientDialogProps {
    open: boolean;
    onClose: () => void;
}

const RegisterPatientDialog: React.FC<RegisterPatientDialogProps> = ({ open, onClose }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        isAdult: null as boolean | null, // true: mayor de edad, false: menor de edad
        firstName: '',
        lastName: '',
        dob: '',
        sex: '',
        cedula: '',
        phone: '',
        whatsapp: '',
        sameWhatsapp: true,
        email: '',
        provincia: '',
        municipio: '',
        direccion: '',
        tutorFirstName: '',
        tutorLastName: '',
        tutorCedula: '',
        tutorSex: '',
        dobTutor: '',
        ars: '',
        plan: '',
        policyNumber: '',
        noInsurance: false,
    });

    // Define los pasos dinámicamente según si es mayor o menor de edad
    const steps = [
        'Edad',
        'Datos del Paciente',
        'Datos de Contacto',
        'Dirección',
        ...(formData.isAdult === false ? ['Datos del Tutor'] : []),
        'Datos del Seguro',
    ];

    const totalSteps = steps.length;

    const handleNext = () => {
        // Aquí puedes agregar validaciones según el paso actual
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>,
        child?: React.ReactNode
    ) => {
        const { name, value } = e.target;
        // Para elementos checkbox, se evalúa el tipo
        const target = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: target.type === 'checkbox' ? target.checked : value,
        }));
    };

    const handleFinish = () => {
        // Aquí se procesaría la información del paciente
        console.log('Paciente registrado', formData);

        if(formData.isAdult == false) {
            httpRequest({
                method: 'PATCH',
                url: '/person',
                data: { 
                        "firstName": formData.tutorFirstName,
                        "lastName": formData.tutorLastName,
                        "typeIdentityCars": "C",
                        "identityCard": formData.tutorCedula,
                        "birthday": formData.dobTutor,
                        "gender": formData.tutorSex,
                        "nickName": "TEST"
                 },
                 requiresAuth: true
              })
                .then(async (res: any) => {
                  console.log(res.personId);
                  httpRequest({
                    method: 'POST',
                    url: '/patient',
                    data: { 
                        person: {
                            "custodioPersonId": res.personId,
                            "firstName": formData.tutorFirstName,
                            "lastName": formData.tutorLastName,
                            "typeIdentityCars": "C",
                            "identityCard": formData.tutorCedula,
                            "birthday": formData.dobTutor,
                            "gender": formData.tutorSex,
                            "nickName": "TEST",
                            "contact": {
                                "phoneNumbers": [
                                  {
                                    "phoneNumber": formData.phone,
                                    "typePhone": "cellphone",
                                    "label": "Home",
                                    "country": "DO"
                                  }
                                ],
                                "socialNetworks": [
                                ],
                              },
                              "address": {
                                "idMunicipaly": formData.municipio,
                                "street": formData.direccion,
                                "apartment": formData.direccion,
                                "country": "DO"
                              }
                        }
                     },
                     requiresAuth: true
                  })
                    .then(async (res: any) => {
                      console.log(res.personId);
    
                    })
                    .catch((err) => {
                      console.log(err);
                    //   toast.error(err.data.message);
                    })
                    .finally(() => {
                    //   setLoading(false);
                    });
                })
                .catch((err) => {
                  console.log(err);
                //   toast.error(err.data.message);
                })
                .finally(() => {
                //   setLoading(false);
                });
        }

        // onClose();
        // // Reinicia el formulario y el step
        // setActiveStep(0);
        // setFormData({
        //     isAdult: null,
        //     firstName: '',
        //     lastName: '',
        //     dob: '',
        //     sex: '',
        //     cedula: '',
        //     phone: '',
        //     whatsapp: '',
        //     sameWhatsapp: true,
        //     email: '',
        //     provincia: '',
        //     municipio: '',
        //     direccion: '',
        //     tutorFirstName: '',
        //     tutorLastName: '',
        //     tutorCedula: '',
        //     tutorSex: '',
        //     dobTutor: '',
        //     ars: '',
        //     plan: '',
        //     policyNumber: '',
        //     noInsurance: false,
        // });
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box display="flex" justifyContent="space-around" my={2}>
                        <Button
                            variant={formData.isAdult === true ? 'contained' : 'outlined'}
                            onClick={() => setFormData({ ...formData, isAdult: true })}
                            startIcon={<PersonIcon />}
                            size="large"
                        >
                            Mayor de Edad
                        </Button>
                        <Button
                            variant={formData.isAdult === false ? 'contained' : 'outlined'}
                            onClick={() => setFormData({ ...formData, isAdult: false })}
                            startIcon={<ChildCareIcon />}
                            size="large"
                        >
                            Menor de Edad
                        </Button>
                    </Box>
                );
            case 1:
                return (
                    <Box display="flex" flexDirection="column" gap={2}>
                        {formData.isAdult && (
                            <TextField
                                label="Cédula"
                                name="cedula"
                                value={formData.cedula}
                                onChange={handleChange}
                                fullWidth
                            />
                        )}
                        <TextField
                            label="Nombres"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Apellidos"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            type="date"
                            label="Fecha de Nacimiento"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Sexo</FormLabel>
                            <RadioGroup row name="sex" value={formData.sex} onChange={handleChange}>
                                <FormControlLabel value="Masculino" control={<Radio />} label="Masculino" />
                                <FormControlLabel value="Femenino" control={<Radio />} label="Femenino" />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                );
            case 2:
                return (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Teléfono"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.sameWhatsapp}
                                    onChange={handleChange}
                                    name="sameWhatsapp"
                                />
                            }
                            label="Mi WhatsApp es el mismo que mi teléfono"
                        />
                        {!formData.sameWhatsapp && (
                            <TextField
                                label="WhatsApp"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                fullWidth
                            />
                        )}
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>
                );
            case 3:
                return (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <FormControl fullWidth>
                            <InputLabel>Provincia</InputLabel>
                            <Select
                                label="Provincia"
                                name="provincia"
                                value={formData.provincia}
                                onChange={handleChange}
                            >
                                {provincias.map((pro) => (
                                    <MenuItem value={pro.provincia_id}>{pro.provincia}</MenuItem>
                                ))};
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Municipio</InputLabel>
                            <Select
                                label="Municipio"
                                name="municipio"
                                value={formData.municipio}
                                onChange={handleChange}
                            >
                                {municipios
                                    .filter((mun) => mun.provincia_id === Number(formData.provincia))
                                    .map((mun) => (
                                        <MenuItem key={mun.municipio_id} value={mun.municipio_id}>
                                            {mun.municipio}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Línea de Dirección"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>
                );
            case 4:
                if (formData.isAdult === false) {
                    return (
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Typography variant="h6">Datos del Tutor</Typography>
                            <TextField
                                label="Cédula del Tutor"
                                name="tutorCedula"
                                value={formData.tutorCedula}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Nombres del Tutor"
                                name="tutorFirstName"
                                value={formData.tutorFirstName}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Apellidos del Tutor"
                                name="tutorLastName"
                                value={formData.tutorLastName}
                                onChange={handleChange}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Sexo</InputLabel>
                                <Select
                                    label="Sexo"
                                    name="tutorSex"
                                    value={formData.tutorSex}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="M">
                                        Masculino
                                    </MenuItem>
                                    <MenuItem value="M">
                                        Femenino
                                    </MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                type="date"
                                label="Fecha de Nacimiento"
                                name="dobTutor"
                                value={formData.dobTutor}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    );
                } else {
                    return (
                        <Box display="flex" flexDirection="column" gap={2}>
                            <FormControl fullWidth disabled={formData.noInsurance}>
                                <InputLabel>ARS</InputLabel>
                                <Select
                                    label="ARS"
                                    name="ars"
                                    value={formData.ars}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="Humano">Humano</MenuItem>
                                    <MenuItem value="Primera">Primera</MenuItem>
                                    <MenuItem value="Senana">Senana</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={formData.noInsurance}>
                                <InputLabel>Plan</InputLabel>
                                <Select
                                    label="Plan"
                                    name="plan"
                                    value={formData.plan}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="Royal">Royal</MenuItem>
                                    <MenuItem value="Gold">Gold</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Número de Póliza"
                                name="policyNumber"
                                value={formData.policyNumber}
                                onChange={handleChange}
                                fullWidth
                                disabled={formData.noInsurance}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.noInsurance}
                                        onChange={handleChange}
                                        name="noInsurance"
                                    />
                                }
                                label="No es asegurado"
                            />
                        </Box>
                    );
                }
            case 5:
                // Este paso solo se muestra si el paciente es menor (se sumó el paso de tutor) y ahora se ingresan los datos del seguro.
                return (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <FormControl fullWidth disabled={formData.noInsurance}>
                            <InputLabel>ARS</InputLabel>
                            <Select
                                label="ARS"
                                name="ars"
                                value={formData.ars}
                                onChange={handleChange}
                            >
                                <MenuItem value="Humano">Humano</MenuItem>
                                <MenuItem value="Primera">Primera</MenuItem>
                                <MenuItem value="Senana">Senana</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth disabled={formData.noInsurance}>
                            <InputLabel>Plan</InputLabel>
                            <Select
                                label="Plan"
                                name="plan"
                                value={formData.plan}
                                onChange={handleChange}
                            >
                                <MenuItem value="Royal">Royal</MenuItem>
                                <MenuItem value="Gold">Gold</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Número de Póliza"
                            name="policyNumber"
                            value={formData.policyNumber}
                            onChange={handleChange}
                            fullWidth
                            disabled={formData.noInsurance}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.noInsurance}
                                    onChange={handleChange}
                                    name="noInsurance"
                                />
                            }
                            label="No es asegurado"
                        />
                    </Box>
                );
            default:
                return 'Paso desconocido';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Slide}
            TransitionProps={{ dir: 'up' }}
        >
            <DialogTitle>Registrar Paciente</DialogTitle>
            <DialogContent dividers>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label, index) => (
                        <Step key={index}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Box mt={2}>{getStepContent(activeStep)}</Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                {activeStep > 0 && <Button onClick={handleBack}>Atrás</Button>}
                {activeStep === totalSteps - 1 ? (
                    <Button variant="contained" onClick={handleFinish}>
                        Finalizar
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={activeStep === 0 && formData.isAdult === null}
                    >
                        Siguiente
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default RegisterPatientDialog;