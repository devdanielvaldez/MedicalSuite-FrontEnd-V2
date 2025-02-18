'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockedDatesTable from './components/blockDatesTable';

export interface BlockedDate {
  id: string;
  date: string; // formato YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  allDay: boolean;
}

const initialBlockedDates: BlockedDate[] = [
  { id: '1', date: '2025-03-10', startTime: '08:00', endTime: '12:00', allDay: false },
  { id: '2', date: '2025-03-15', startTime: '', endTime: '', allDay: true },
];

export interface BlockedDatesTableProps {
  blockedDates: BlockedDate[];
  onEdit: (bd: BlockedDate) => void;
  onDelete: (bd: BlockedDate) => void;
}

interface BlockDateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (bd: BlockedDate) => void;
  initialData?: BlockedDate;
}

const BlockDateDialog: React.FC<BlockDateDialogProps> = ({ open, onClose, onSave, initialData }) => {
  const [date, setDate] = useState(initialData ? initialData.date : '');
  const [allDay, setAllDay] = useState(initialData ? initialData.allDay : false);
  const [startTime, setStartTime] = useState(initialData ? initialData.startTime : '');
  const [endTime, setEndTime] = useState(initialData ? initialData.endTime : '');

  const handleSave = () => {
    const newBlockedDate: BlockedDate = {
      id: initialData ? initialData.id : Math.random().toString(36).substr(2, 9),
      date,
      allDay,
      startTime: allDay ? '' : startTime,
      endTime: allDay ? '' : endTime,
    };
    onSave(newBlockedDate);
    // Reiniciar campos
    setDate('');
    setAllDay(false);
    setStartTime('');
    setEndTime('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Editar Bloqueo de Fecha' : 'Bloquear Fecha'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Calendario simulado con input type date */}
          <TextField
            label="Seleccionar Fecha"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={<Checkbox checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />}
            label="Bloquear todo el día"
          />
          {!allDay && (
            <>
              <TextField
                label="Hora de Inicio"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Hora Final"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteConfirmDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <Typography>¿Está seguro de que desea eliminar este bloqueo?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onConfirm} color="error">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const BlockDatesScreen: React.FC = () => {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(initialBlockedDates);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDate, setEditingDate] = useState<BlockedDate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<BlockedDate | null>(null);

  const handleOpenDialog = () => {
    setEditingDate(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveBlockedDate = (bd: BlockedDate) => {
    if (editingDate) {
      setBlockedDates(blockedDates.map((d) => (d.id === bd.id ? bd : d)));
    } else {
      setBlockedDates([...blockedDates, bd]);
    }
  };

  const handleEdit = (bd: BlockedDate) => {
    setEditingDate(bd);
    setOpenDialog(true);
  };

  const handleDelete = (bd: BlockedDate) => {
    setSelectedToDelete(bd);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedToDelete) {
      setBlockedDates(blockedDates.filter((d) => d.id !== selectedToDelete.id));
    }
    setDeleteDialogOpen(false);
    setSelectedToDelete(null);
  };

  return (
    <PageContainer title="Bloquear Fechas" description="Gestione las fechas bloqueadas">
      <Box sx={{ position: 'relative', p: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <BlockedDatesTable blockedDates={blockedDates} onEdit={handleEdit} onDelete={handleDelete} />
          </Grid>
        </Grid>
        <BlockDateDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSave={handleSaveBlockedDate}
          initialData={editingDate || undefined}
        />
        <DeleteConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={confirmDelete} />
        {/* Botón flotante para bloquear fecha */}
        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <Fab color="primary" onClick={handleOpenDialog}>
            <AddIcon />
          </Fab>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default BlockDatesScreen;