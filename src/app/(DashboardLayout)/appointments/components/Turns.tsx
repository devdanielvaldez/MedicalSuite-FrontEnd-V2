'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  SlideProps,
  Slide,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

// -----------------------------------------------------------------------------
// Datos de ejemplo
// -----------------------------------------------------------------------------
const patients = [
  {
    id: "1",
    firstName: "Daniel",
    lastName: "Valdez",
    phone: "+1 (809) 000 - 1111",
    date: "10/10/2025",
    hour: "09:00 AM",
    status: "PE",
    insurance: "HUMANO",
  },
];

const samplePatients = [
  { id: '1', name: 'Daniel Valdez' },
  { id: '2', name: 'Ana Martínez' },
  { id: '3', name: 'Luis Pérez' },
];

const Transition = React.forwardRef<unknown, SlideProps>(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Turn {
    id: string;
    name: string;
  }
  
  interface ViewTurnsModalProps {
    open: boolean;
    onClose: () => void;
    turns: Turn[];
    setTurns: React.Dispatch<React.SetStateAction<Turn[]>>;
  }
  
  const ViewTurnsModal: React.FC<ViewTurnsModalProps> = ({ open, onClose, turns, setTurns }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
    const handleDragStart = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
    };
  
    const handleDragOver = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };
  
    const handleDrop = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (draggedIndex === null) return;
      const newTurns = Array.from(turns);
      const [movedItem] = newTurns.splice(draggedIndex, 1);
      newTurns.splice(index, 0, movedItem);
      setTurns(newTurns);
      setDraggedIndex(null);
    };
  
    return (
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            p: 3,
            borderRadius: 2,
            boxShadow: 3,
            background: 'linear-gradient(135deg, #ffffff, #f2f2f2)',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          Turnos de Pacientes
          <IconButton
            aria-label="cerrar"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.600' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              minHeight: 200,
              p: 1,
              backgroundColor: '#f9f9f9',
              borderRadius: 1,
            }}
          >
            {turns.map((turn, index) => (
              <Box
                key={turn.id}
                draggable
                onDragStart={handleDragStart(index)}
                onDragOver={handleDragOver(index)}
                onDrop={handleDrop(index)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: draggedIndex === index ? 'primary.light' : '#ffffff',
                  boxShadow: draggedIndex === index ? 6 : 2,
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: draggedIndex === index ? 'primary.main' : 'grey.300',
                  cursor: 'grab',
                }}
              >
                <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" sx={{ color: 'text.primary' }}>
                  {turn.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  export default ViewTurnsModal;