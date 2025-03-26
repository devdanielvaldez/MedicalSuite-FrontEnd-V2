"use client";

import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import PersonIcon from "@mui/icons-material/Person";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import { provincias } from "@/app/data/provincias";
import { municipios } from "@/app/data/municipios";
import { httpRequest } from "@/app/utils/http";
import { toast, ToastContainer } from "react-toastify";

interface Insurance {
  insuranceId: number;
  insuranceName: string;
  insurancePlan: InsurancePlan[];
}

interface InsurancePlan {
  insurancePlanId: number;
  insurancePlanName: string;
  insurancePlanDescription: string;
}

interface RegisterPatientDialogProps {
  open: boolean;
  onClose: () => void;
}

const RegisterPatientDialog: React.FC<RegisterPatientDialogProps> = ({
  open,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingCedula, setIsSearchingCedula] = useState(false);
  const [isSearchingTutorCedula, setIsSearchingTutorCedula] = useState(false);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loadingInsurances, setLoadingInsurances] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<InsurancePlan[]>([]);
  
  const [formData, setFormData] = useState({
    isAdult: null as boolean | null,
    firstName: "",
    lastName: "",
    dob: "",
    sex: "",
    cedula: "",
    phone: "",
    whatsapp: "",
    sameWhatsapp: true,
    email: "",
    provincia: "",
    municipio: "",
    direccion: "",
    tutorFirstName: "",
    tutorLastName: "",
    tutorCedula: "",
    tutorSex: "",
    dobTutor: "",
    ars: "",
    plan: "",
    policyNumber: "",
    noInsurance: false,
  });

  // Cargar los seguros cuando el componente se monta o cuando se llega a la pantalla de seguros
  useEffect(() => {
    // Solo cargar seguros si estamos en el paso de seguros y aún no se han cargado
    if ((activeStep === 4 && formData.isAdult === true) || 
        (activeStep === 5 && formData.isAdult === false)) {
      if (insurances.length === 0 && !loadingInsurances) {
        loadInsurances();
      }
    }
  }, [activeStep, formData.isAdult]);

  // Actualizar planes disponibles cuando cambie el seguro seleccionado
  useEffect(() => {
    if (formData.ars) {
      const selectedInsurance = insurances.find(
        (ins) => ins.insuranceId.toString() === formData.ars
      );
      if (selectedInsurance) {
        setAvailablePlans(selectedInsurance.insurancePlan);
        // Resetear el plan seleccionado cuando cambia el seguro
        setFormData(prev => ({ ...prev, plan: "" }));
      }
    } else {
      setAvailablePlans([]);
    }
  }, [formData.ars, insurances]);

  // Cargar seguros desde la API
  const loadInsurances = async () => {
    setLoadingInsurances(true);
    try {
      const response = await httpRequest({
        method: "GET",
        url: "/insurance/insurances",
        requiresAuth: true,
      });
      
      if (response && Array.isArray(response)) {
        setInsurances(response);
      }
    } catch (error) {
      console.error("Error al cargar seguros:", error);
      toast.error("No se pudieron cargar los seguros");
    } finally {
      setLoadingInsurances(false);
    }
  };

  // Define los pasos dinámicamente según si es mayor o menor de edad
  const steps = [
    "Edad",
    "Datos del Paciente",
    "Datos de Contacto",
    "Dirección",
    ...(formData.isAdult === false ? ["Datos del Tutor"] : []),
    "Datos del Seguro",
  ];

  const totalSteps = steps.length;

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>,
    child?: React.ReactNode
  ) => {
    const { name, value } = e.target;
    // Para elementos checkbox, se evalúa el tipo
    const target = e.target as HTMLInputElement;
    
    // Si es el campo de cédula del paciente y tiene 11 caracteres, buscar en la API
    if (name === "cedula" && value.length === 11 && formData.isAdult) {
      searchByCedula(value);
    }
    
    // Si es el campo de cédula del tutor y tiene 11 caracteres, buscar en la API
    if (name === "tutorCedula" && value.length === 11) {
      searchByTutorCedula(value);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: target.type === "checkbox" ? target.checked : value,
    }));
  };

  // Función para buscar por cédula del paciente
  const searchByCedula = async (cedula: string) => {
    setIsSearchingCedula(true);
    
    try {
      const response: any = await httpRequest({
        method: "GET",
        url: `/person/find/${cedula}`,
        requiresAuth: true,
      });
      
      // Si hay respuesta, llenar los datos del formulario
      if (response) {
        setFormData(prev => ({
          ...prev,
          firstName: response.NombresPlastico || "",
          lastName: response.ApellidosPlastico || "",
          sex: response.IdSexo || "",
          dob: response.FechaNacimiento 
            ? new Date(response.FechaNacimiento).toISOString().split('T')[0] 
            : "",
        }));
        toast.success("Información del paciente encontrada correctamente");
      }
    } catch (error) {
      console.error("Error al buscar la cédula:", error);
      toast.error("No se pudo encontrar información para esta cédula");
    } finally {
      setIsSearchingCedula(false);
    }
  };

  // Nueva función para buscar por cédula del tutor
  const searchByTutorCedula = async (cedula: string) => {
    setIsSearchingTutorCedula(true);
    
    try {
      const response: any = await httpRequest({
        method: "GET",
        url: `/person/find/${cedula}`,
        requiresAuth: true,
      });
      
      // Si hay respuesta, llenar los datos del tutor
      if (response) {
        setFormData(prev => ({
          ...prev,
          tutorFirstName: response.NombresPlastico || "",
          tutorLastName: response.ApellidosPlastico || "",
          tutorSex: response.IdSexo || "",
          dobTutor: response.FechaNacimiento 
            ? new Date(response.FechaNacimiento).toISOString().split('T')[0] 
            : "",
        }));
        toast.success("Información del tutor encontrada correctamente");
      }
    } catch (error) {
      console.error("Error al buscar la cédula del tutor:", error);
      toast.error("No se pudo encontrar información para esta cédula");
    } finally {
      setIsSearchingTutorCedula(false);
    }
  };

  const handleFinish = () => {
    console.log("entro");
    // Aquí se procesaría la información del paciente
    console.log("Paciente registrado", formData);
    setIsLoading(true);

    // Preparar datos del seguro (solo si no marcó "No es asegurado")
    let insurancesData = [];
    if (!formData.noInsurance && formData.ars) {
      insurancesData.push({
        insuranceId: parseInt(formData.ars),  // ID del seguro seleccionado
        planId: formData.plan ? parseInt(formData.plan) : undefined,  // ID del plan seleccionado
        policyNumber: formData.policyNumber || undefined
      });
    }

    if (formData.isAdult == false) {
      httpRequest({
        method: "PATCH",
        url: "/person",
        data: {
          firstName: formData.tutorFirstName,
          lastName: formData.tutorLastName,
          typeIdentityCars: "C",
          identityCard: formData.tutorCedula,
          birthday: formData.dobTutor,
          gender: formData.tutorSex,
          nickName: "TEST",
        },
        requiresAuth: true,
      })
        .then(async (res: any) => {
          console.log(res.personId);
          httpRequest({
            method: "POST",
            url: "/patient",
            data: {
              person: {
                custodioPersonId: res.personId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                typeIdentityCars: "C",
                identityCard: formData.cedula,
                birthday: formData.dob,
                gender: formData.sex,
                nickName: "TEST",
                contact: {
                  phoneNumbers: [
                    {
                      phoneNumber: formData.phone,
                      typePhone: "cellphone",
                      label: "Home",
                      country: "DO",
                    },
                  ],
                  socialNetworks: [],
                },
                address: {
                  idMunicipaly: formData.municipio,
                  street: formData.direccion,
                  apartment: formData.direccion,
                  country: "DO",
                },
                insurances: insurancesData, // Añadir datos de seguros
              },
              patientBranchOfficeId: localStorage.getItem(
                "selectedBranchOffice"
              ),
            },
            requiresAuth: true,
          })
            .then(async (res: any) => {
              toast.success("Paciente registrado correctamente.");
              setIsLoading(false);
              onClose();
              setActiveStep(0);
              setFormData({
                isAdult: null,
                firstName: "",
                lastName: "",
                dob: "",
                sex: "",
                cedula: "",
                phone: "",
                whatsapp: "",
                sameWhatsapp: true,
                email: "",
                provincia: "",
                municipio: "",
                direccion: "",
                tutorFirstName: "",
                tutorLastName: "",
                tutorCedula: "",
                tutorSex: "",
                dobTutor: "",
                ars: "",
                plan: "",
                policyNumber: "",
                noInsurance: false,
              });
            })
            .catch((err) => {
              setIsLoading(false);
              console.log(err);
              toast.error(err.data.message);
            })
            .finally(() => {
              setIsLoading(false);
            });
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
          toast.error(err.data.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } 
    
    if(formData.isAdult == true) {
          httpRequest({
            method: "POST",
            url: "/patient",
            data: {
              person: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                typeIdentityCars: "C",
                identityCard: formData.cedula,
                birthday: formData.dob,
                gender: formData.sex,
                nickName: "TEST",
                contact: {
                  phoneNumbers: [
                    {
                      phoneNumber: formData.phone,
                      typePhone: "cellphone",
                      label: "Home",
                      country: "DO",
                    },
                  ],
                  socialNetworks: [],
                },
                address: {
                  idMunicipaly: formData.municipio,
                  street: formData.direccion,
                  apartment: formData.direccion,
                  country: "DO",
                },
                insurances: insurancesData, // Añadir datos de seguros
              },
              patientBranchOfficeId: localStorage.getItem(
                "selectedBranchOffice"
              ),
            },
            requiresAuth: true,
          })
            .then(async (res: any) => {
              toast.success("Paciente registrado correctamente.");
              setIsLoading(false);
              onClose();
              setActiveStep(0);
              setFormData({
                isAdult: null,
                firstName: "",
                lastName: "",
                dob: "",
                sex: "",
                cedula: "",
                phone: "",
                whatsapp: "",
                sameWhatsapp: true,
                email: "",
                provincia: "",
                municipio: "",
                direccion: "",
                tutorFirstName: "",
                tutorLastName: "",
                tutorCedula: "",
                tutorSex: "",
                dobTutor: "",
                ars: "",
                plan: "",
                policyNumber: "",
                noInsurance: false,
              });
            })
            .catch((err) => {
              setIsLoading(false);
              console.log(err);
              toast.error(err.data.message);
            })
            .finally(() => {
              setIsLoading(false);
            });
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box display="flex" justifyContent="space-around" my={2}>
            <Button
              variant={formData.isAdult === true ? "contained" : "outlined"}
              onClick={() => setFormData({ ...formData, isAdult: true })}
              startIcon={<PersonIcon />}
              size="large"
            >
              Mayor de Edad
            </Button>
            <Button
              variant={formData.isAdult === false ? "contained" : "outlined"}
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
                helperText="Digite los 11 dígitos de la cédula para buscar"
                InputProps={{
                  endAdornment: isSearchingCedula && (
                    <CircularProgress size={20} color="inherit" />
                  ),
                }}
              />
            )}
            <TextField
              label="Nombres"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              disabled={isSearchingCedula}
            />
            <TextField
              label="Apellidos"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              disabled={isSearchingCedula}
            />
            <TextField
              type="date"
              label="Fecha de Nacimiento"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={isSearchingCedula}
            />
            <FormControl component="fieldset" disabled={isSearchingCedula}>
              <FormLabel component="legend">Sexo</FormLabel>
              <RadioGroup
                row
                name="sex"
                value={formData.sex}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="M"
                  control={<Radio />}
                  label="Masculino"
                />
                <FormControlLabel
                  value="F"
                  control={<Radio />}
                  label="Femenino"
                />
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
                  <MenuItem key={pro.provincia_id} value={pro.provincia_id}>{pro.provincia}</MenuItem>
                ))}
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
                  .filter(
                    (mun) => mun.provincia_id === Number(formData.provincia)
                  )
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
                helperText="Digite los 11 dígitos de la cédula para buscar"
                InputProps={{
                  endAdornment: isSearchingTutorCedula && (
                    <CircularProgress size={20} color="inherit" />
                  ),
                }}
              />
              <TextField
                label="Nombres del Tutor"
                name="tutorFirstName"
                value={formData.tutorFirstName}
                onChange={handleChange}
                fullWidth
                disabled={isSearchingTutorCedula}
              />
              <TextField
                label="Apellidos del Tutor"
                name="tutorLastName"
                value={formData.tutorLastName}
                onChange={handleChange}
                fullWidth
                disabled={isSearchingTutorCedula}
              />
              <FormControl fullWidth disabled={isSearchingTutorCedula}>
                <InputLabel>Sexo</InputLabel>
                <Select
                  label="Sexo"
                  name="tutorSex"
                  value={formData.tutorSex}
                  onChange={handleChange}
                >
                  <MenuItem value="M">Masculino</MenuItem>
                  <MenuItem value="F">Femenino</MenuItem>
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
                disabled={isSearchingTutorCedula}
              />
            </Box>
          );
        } else {
          // Para adultos, mostrar el formulario de seguros con datos dinámicos
          return (
            <Box display="flex" flexDirection="column" gap={2}>
              {loadingInsurances ? (
                <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2 }} />
              ) : (
                <>
                  <FormControl fullWidth disabled={formData.noInsurance}>
                    <InputLabel>ARS</InputLabel>
                    <Select
                      label="ARS"
                      name="ars"
                      value={formData.ars}
                      onChange={handleChange}
                    >
                      {insurances.map((insurance) => (
                        <MenuItem key={insurance.insuranceId} value={insurance.insuranceId.toString()}>
                          {insurance.insuranceName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth disabled={formData.noInsurance || !formData.ars}>
                    <InputLabel>Plan</InputLabel>
                    <Select
                      label="Plan"
                      name="plan"
                      value={formData.plan}
                      onChange={handleChange}
                    >
                      {availablePlans.map((plan) => (
                        <MenuItem key={plan.insurancePlanId} value={plan.insurancePlanId.toString()}>
                          {plan.insurancePlanName}
                        </MenuItem>
                      ))}
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
                </>
              )}
            </Box>
          );
        }
      case 5:
        // Este paso solo se muestra si el paciente es menor (se sumó el paso de tutor) y ahora se ingresan los datos del seguro.
        return (
          <Box display="flex" flexDirection="column" gap={2}>
            {loadingInsurances ? (
              <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2 }} />
            ) : (
              <>
                <FormControl fullWidth disabled={formData.noInsurance}>
                  <InputLabel>ARS</InputLabel>
                  <Select
                    label="ARS"
                    name="ars"
                    value={formData.ars}
                    onChange={handleChange}
                  >
                    {insurances.map((insurance) => (
                      <MenuItem key={insurance.insuranceId} value={insurance.insuranceId.toString()}>
                        {insurance.insuranceName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth disabled={formData.noInsurance || !formData.ars}>
                  <InputLabel>Plan</InputLabel>
                  <Select
                    label="Plan"
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                  >
                    {availablePlans.map((plan) => (
                      <MenuItem key={plan.insurancePlanId} value={plan.insurancePlanId.toString()}>
                        {plan.insurancePlanName}
                      </MenuItem>
                    ))}
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
              </>
            )}
          </Box>
        );
      default:
        return "Paso desconocido";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Slide}
      TransitionProps={{ dir: "up" }}
    >
      <ToastContainer />
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
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Finalizar"
            )}
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