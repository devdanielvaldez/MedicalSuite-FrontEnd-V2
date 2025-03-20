"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  CircularProgress,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormControlLabel,
  Checkbox,
  ListItem,
  List,
  Tab,
  Tabs,
} from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { httpRequest } from "@/app/utils/http";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Iconos
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import RemoveIcon from "@mui/icons-material/Remove";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { FieldDataType } from "@/app/utils/enums";

// Interfaces
interface MedicalHistoryTemplateField {
  id?: number;
  fieldName: string;
  dataType: FieldDataType;
  listOptions?: string;
  fieldOrder: number;
  validationRules?: string;
  isActive: boolean;
  templateId?: number;
  clientId?: string; // Para estabilidad con react-beautiful-dnd
}

interface MedicalHistoryTemplate {
  id?: number;
  name: string;
  doctorId: number;
  fields: MedicalHistoryTemplateField[];
}

const MedicalHistoryTemplatesPage: React.FC = () => {
  // Estados
  const [templates, setTemplates] = useState<MedicalHistoryTemplate[] | any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentTemplate, setCurrentTemplate] = useState<MedicalHistoryTemplate | any>(null);
  const [doctorId, setDoctorId] = useState<number>(0);
  const [tabValue, setTabValue] = useState<number>(0);

  // Obtener plantillas al cargar la página
  useEffect(() => {
    const userDoctorId = localStorage.getItem("doctorId");
    if (userDoctorId) {
      setDoctorId(parseInt(userDoctorId));
      fetchTemplates();
    }
  }, []);

  // Función para obtener plantillas del servidor
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await httpRequest({
        url: "/medical-history-templates/my-templates",
        method: "GET",
        requiresAuth: true,
      });
      setTemplates(response || []);
    } catch (error) {
      console.error("Error al obtener plantillas:", error);
      toast.error("Error al cargar las plantillas");
    } finally {
      setLoading(false);
    }
  };

const saveTemplate = async (template: MedicalHistoryTemplate) => {
  try {
    const templateToSave = {
      id: template.id,
      name: template.name,
      doctorId: template.doctorId,
      fields: template.fields.map(field => {
        const { 
          clientId, 
          createdAt, 
          updatedAt, 
          deletedAt,
          templateId,
          isActive,
          ...cleanField 
        } = field as any;
        
        return cleanField;
      })
    };

    const response = await httpRequest({
      url: "/medical-history-templates",
      method: "POST",
      data: templateToSave,
      requiresAuth: true,
    });

    if (template.id) {
      setTemplates(templates.map((t: any) => (t.id === template.id ? response : t)));
      toast.success("Plantilla actualizada correctamente");
    } else {
      setTemplates([...templates, response]);
      toast.success("Plantilla creada correctamente");
    }

    setOpenDialog(false);
    setCurrentTemplate(null);
  } catch (error) {
    console.error("Error al guardar plantilla:", error);
    toast.error("Error al guardar la plantilla");
  }
};

  // Función para eliminar plantilla
  const deleteTemplate = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta plantilla?")) return;

    try {
      await httpRequest({
        url: `/medical-history-templates/${id}`,
        method: "DELETE",
        requiresAuth: true,
      });

      setTemplates(templates.map((t: any) => 
        t.id === id ? {...t, deletedAt: new Date().toISOString()} : t
      ));
      toast.success("Plantilla eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar plantilla:", error);
      toast.error("Error al eliminar la plantilla");
    }
  };

  // Función para restaurar plantilla
  const restoreTemplate = async (id: number) => {
    try {
      const response = await httpRequest({
        url: `/medical-history-templates/${id}/restore`,
        method: "POST",
        requiresAuth: true,
      });

      setTemplates(templates.map((t: any) => t.id === id ? response : t));
      toast.success("Plantilla restaurada correctamente");
    } catch (error) {
      console.error("Error al restaurar plantilla:", error);
      toast.error("Error al restaurar la plantilla");
    }
  };

  // Función para abrir diálogo de edición
  const handleEditTemplate = (template: MedicalHistoryTemplate) => {
    setCurrentTemplate({...template});
    setOpenDialog(true);
  };

  // Función para abrir diálogo de creación
  const handleNewTemplate = () => {
    setCurrentTemplate({
      name: "",
      doctorId: doctorId,
      fields: []
    });
    setOpenDialog(true);
  };

  // Cambiar pestañas entre activas y eliminadas
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filtrar plantillas según la pestaña seleccionada
  const filteredTemplates = templates.filter((t: any) => 
    tabValue === 0 ? !t.deletedAt : t.deletedAt
  );

  return (
    <PageContainer title="Plantillas de Historias Clínicas" description="Gestión de plantillas para historias clínicas">
      <ToastContainer />
      
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center" marginBottom={2}>
            <Grid item xs>
              <Typography variant="h4">Plantillas de Historias Clínicas</Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewTemplate}
              >
                Nueva Plantilla
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Plantillas Activas" />
              <Tab label="Plantillas Eliminadas" />
            </Tabs>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" padding={4}>
              <CircularProgress />
            </Box>
          ) : filteredTemplates.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Campos</TableCell>
                    <TableCell>Fecha de Creación</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTemplates.map((template: any) => (
                    <TableRow key={template.id}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.fields?.length || 0}</TableCell>
                      <TableCell>
                        {new Date(template.createdAt!).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {!template.deletedAt ? (
                          <>
                            <IconButton onClick={() => handleEditTemplate(template)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => deleteTemplate(template.id!)}>
                              <DeleteIcon color="error" />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton onClick={() => restoreTemplate(template.id!)}>
                            <RestoreIcon color="primary" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography align="center" paddingY={4}>
              No hay plantillas {tabValue === 0 ? "activas" : "eliminadas"}.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para crear/editar plantilla */}
      {currentTemplate && (
        <TemplateDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setCurrentTemplate(null);
          }}
          template={currentTemplate}
          onSave={saveTemplate}
        />
      )}
    </PageContainer>
  );
};

interface TemplateDialogProps {
  open: boolean;
  onClose: () => void;
  template: MedicalHistoryTemplate;
  onSave: (template: MedicalHistoryTemplate) => void;
}

const TemplateDialog: React.FC<TemplateDialogProps> = ({
  open,
  onClose,
  template,
  onSave,
}) => {
  const [editedTemplate, setEditedTemplate] = useState<MedicalHistoryTemplate>(template);
  const [saving, setSaving] = useState<boolean>(false);
  const [expandedValidations, setExpandedValidations] = useState<number | null>(null);

  useEffect(() => {
    // Asegúrate de que los campos tengan una propiedad clientId para estabilidad
    const fieldsWithClientIds = template.fields.map((field, index) => ({
      ...field,
      clientId: field.id ? `existing-${field.id}` : `new-${index}-${Date.now()}`
    }));

    setEditedTemplate({
      ...template,
      fields: fieldsWithClientIds
    });
  }, [template]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTemplate({
      ...editedTemplate,
      name: e.target.value,
    });
  };

  const handleSave = () => {
    if (!editedTemplate.name.trim()) {
      toast.error("El nombre de la plantilla es obligatorio");
      return;
    }

    // Asegurarnos que el orden de los campos sea correcto
    const fieldsWithOrder = editedTemplate.fields.map((field, index) => ({
      ...field,
      fieldOrder: index
    }));

    setSaving(true);
    onSave({
      ...editedTemplate,
      fields: fieldsWithOrder
    });
  };

  const handleAddField = () => {
    const newField: MedicalHistoryTemplateField = {
      fieldName: "",
      dataType: FieldDataType.TEXTO,
      fieldOrder: editedTemplate.fields.length,
      isActive: true,
      validationRules: "",
      listOptions: "",
      clientId: `new-${editedTemplate.fields.length}-${Date.now()}`
    };

    setEditedTemplate({
      ...editedTemplate,
      fields: [...editedTemplate.fields, newField],
    });
  };

  const handleFieldChange = (index: number, field: Partial<MedicalHistoryTemplateField>) => {
    const newFields = [...editedTemplate.fields];
    newFields[index] = { ...newFields[index], ...field };
    setEditedTemplate({
      ...editedTemplate,
      fields: newFields,
    });
  };

  const handleRemoveField = (index: number) => {
    const newFields = [...editedTemplate.fields];
    newFields.splice(index, 1);
    setEditedTemplate({
      ...editedTemplate,
      fields: newFields,
    });
  };

  const handleDragEnd = (result: any) => {
    // Ignorar si se suelta fuera del área de destino
    if (!result.destination) return;
    
    const items = Array.from(editedTemplate.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setEditedTemplate({
      ...editedTemplate,
      fields: items
    });
  };

  // Función para expandir/colapsar la sección de validaciones
  const toggleValidations = (index: number) => {
    setExpandedValidations(expandedValidations === index ? null : index);
  };

  // Función para actualizar una validación específica
  const updateValidation = (index: number, validationType: string, value: any) => {
    const field = editedTemplate.fields[index];
    let currentRules = {};
    
    if (field.validationRules) {
      try {
        currentRules = JSON.parse(field.validationRules);
      } catch (e) {
        console.error("Error parsing validation rules:", e);
      }
    }
    
    const updatedRules: any = {
      ...currentRules,
      [validationType]: value
    };
    
    // Si el valor es falso o vacío, eliminar la regla
    if (value === false || value === "" || value === null) {
      delete updatedRules[validationType];
    }
    
    handleFieldChange(index, { 
      validationRules: Object.keys(updatedRules).length > 0 ? JSON.stringify(updatedRules) : "" 
    });
  };

  // Obtener el valor actual de una validación
  const getValidationValue = (field: MedicalHistoryTemplateField, validationType: string) => {
    if (!field.validationRules) return null;
    try {
      const rules = JSON.parse(field.validationRules);
      return rules[validationType];
    } catch (e) {
      return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {template.id ? "Editar Plantilla" : "Nueva Plantilla"}
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={3}>
          <TextField
            label="Nombre de la Plantilla"
            fullWidth
            value={editedTemplate.name}
            onChange={handleChange}
            disabled={saving}
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Campos de la Plantilla
        </Typography>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {editedTemplate.fields.map((field, index) => (
                  <Draggable 
                    key={field.clientId || `field-${index}`}
                    draggableId={field.clientId || `field-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        elevation={2}
                        sx={{ mb: 2, p: 2 }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={1}>
                            <div {...provided.dragHandleProps}>
                              <DragHandleIcon color="action" />
                            </div>
                          </Grid>
                          <Grid item xs={8} sm={7}>
                            <TextField
                              label="Nombre del Campo"
                              fullWidth
                              value={field.fieldName}
                              onChange={(e) => handleFieldChange(index, { fieldName: e.target.value })}
                              disabled={saving}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Tipo de Dato</InputLabel>
                              <Select
                                value={field.dataType}
                                label="Tipo de Dato"
                                onChange={(e) => handleFieldChange(index, { dataType: e.target.value as FieldDataType })}
                                disabled={saving}
                              >
                                <MenuItem value={FieldDataType.TEXTO}>Texto</MenuItem>
                                <MenuItem value={FieldDataType.NUMERO}>Número</MenuItem>
                                <MenuItem value={FieldDataType.FECHA}>Fecha</MenuItem>
                                <MenuItem value={FieldDataType.BOOLEANO}>Sí/No</MenuItem>
                                <MenuItem value={FieldDataType.LISTA}>Lista Desplegable</MenuItem>
                                <MenuItem value={FieldDataType.TEXTO_LARGO}>Área de Texto</MenuItem>
                                <MenuItem value={FieldDataType.MULTIPLE}>Opciones</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={1}>
                            <IconButton onClick={() => handleRemoveField(index)} disabled={saving}>
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Grid>
                          
                          {(field.dataType === FieldDataType.LISTA || 
                            field.dataType === FieldDataType.BOOLEANO || 
                            field.dataType === FieldDataType.MULTIPLE) && (
                            <Grid item xs={12}>
                              <TextField
                                label="Opciones (separadas por comas)"
                                fullWidth
                                value={field.listOptions || ""}
                                onChange={(e) => handleFieldChange(index, { listOptions: e.target.value })}
                                disabled={saving}
                                size="small"
                                helperText="Ejemplo: Opción 1,Opción 2,Opción 3"
                              />
                            </Grid>
                          )}
                          
                          {/* Sección de validaciones mejorada */}
                          <Grid item xs={12}>
                            <Button
                              onClick={() => toggleValidations(index)}
                              startIcon={expandedValidations === index ? <RemoveIcon /> : <AddIcon />}
                              variant="outlined"
                              color="primary"
                              size="small"
                              fullWidth
                              sx={{ mt: 1 }}
                            >
                              {expandedValidations === index ? "Ocultar Validaciones" : "Configurar Validaciones"}
                            </Button>
                            
                            {expandedValidations === index && (
                              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mt: 1 }}>
                                <Grid container spacing={2}>
                                  {/* Validación común para todos los campos: Requerido */}
                                  <Grid item xs={12}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox 
                                          checked={!!getValidationValue(field, "required")} 
                                          onChange={(e) => updateValidation(index, "required", e.target.checked)}
                                        />
                                      }
                                      label="Campo requerido"
                                    />
                                  </Grid>
                                  
                                  {/* Validaciones específicas según el tipo de campo */}
                                  {(field.dataType === FieldDataType.TEXTO || field.dataType === FieldDataType.TEXTO_LARGO) && (
                                    <>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          label="Longitud Mínima"
                                          type="number"
                                          fullWidth
                                          size="small"
                                          value={getValidationValue(field, "minLength") || ""}
                                          onChange={(e) => updateValidation(index, "minLength", e.target.value ? parseInt(e.target.value) : "")}
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          label="Longitud Máxima"
                                          type="number"
                                          fullWidth
                                          size="small"
                                          value={getValidationValue(field, "maxLength") || ""}
                                          onChange={(e) => updateValidation(index, "maxLength", e.target.value ? parseInt(e.target.value) : "")}
                                        />
                                      </Grid>
                                      <Grid item xs={12}>
                                        <TextField
                                          label="Patrón Regex (opcional)"
                                          fullWidth
                                          size="small"
                                          value={getValidationValue(field, "pattern") || ""}
                                          onChange={(e) => updateValidation(index, "pattern", e.target.value)}
                                          helperText="Ejemplo para email: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"
                                        />
                                      </Grid>
                                    </>
                                  )}
                                  
                                  {field.dataType === FieldDataType.NUMERO && (
                                    <>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          label="Valor Mínimo"
                                          type="number"
                                          fullWidth
                                          size="small"
                                          value={getValidationValue(field, "min") || ""}
                                          onChange={(e) => updateValidation(index, "min", e.target.value ? parseFloat(e.target.value) : "")}
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          label="Valor Máximo"
                                          type="number"
                                          fullWidth
                                          size="small"
                                          value={getValidationValue(field, "max") || ""}
                                          onChange={(e) => updateValidation(index, "max", e.target.value ? parseFloat(e.target.value) : "")}
                                        />
                                      </Grid>
                                      <Grid item xs={12}>
                                        <FormControlLabel
                                          control={
                                            <Checkbox 
                                              checked={!!getValidationValue(field, "integer")} 
                                              onChange={(e) => updateValidation(index, "integer", e.target.checked)}
                                            />
                                          }
                                          label="Solo números enteros"
                                        />
                                      </Grid>
                                    </>
                                  )}
                                  
                                  {field.dataType === FieldDataType.FECHA && (
                                    <>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          label="Fecha Mínima"
                                          type="date"
                                          fullWidth
                                          size="small"
                                          value={getValidationValue(field, "minDate") || ""}
                                          onChange={(e) => updateValidation(index, "minDate", e.target.value)}
                                          InputLabelProps={{ shrink: true }}
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          label="Fecha Máxima"
                                          type="date"
                                          fullWidth
                                          size="small"
                                          value={getValidationValue(field, "maxDate") || ""}
                                          onChange={(e) => updateValidation(index, "maxDate", e.target.value)}
                                          InputLabelProps={{ shrink: true }}
                                        />
                                      </Grid>
                                    </>
                                  )}
                                  
                                  {field.dataType === FieldDataType.MULTIPLE && (
                                    <Grid item xs={12}>
                                      <TextField
                                        label="Selecciones Mínimas"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        value={getValidationValue(field, "minChecked") || ""}
                                        onChange={(e) => updateValidation(index, "minChecked", e.target.value ? parseInt(e.target.value) : "")}
                                      />
                                    </Grid>
                                  )}
                                </Grid>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </Paper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          fullWidth
          onClick={handleAddField}
          disabled={saving}
          sx={{ mt: 2 }}
        >
          Agregar Campo
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          startIcon={saving && <CircularProgress size={20} />}
        >
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicalHistoryTemplatesPage;