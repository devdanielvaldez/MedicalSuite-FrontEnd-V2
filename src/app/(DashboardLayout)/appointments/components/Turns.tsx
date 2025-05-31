"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  SlideProps,
  Slide,
  Button,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { httpRequest } from "@/app/utils/http";
import { useRouter } from "next/navigation";

const Transition = React.forwardRef<unknown, SlideProps>(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Turn {
  id: string;
  name: string;
  statusAppointment: string;
  shiftAppointmentId: string;
  shiftPersonId: string;
}

interface ViewTurnsModalProps {
  open: boolean;
  onClose: () => void;
  branchOfficeId: string;
}

const ViewTurnsModal: React.FC<ViewTurnsModalProps> = ({
  open,
  onClose,
  branchOfficeId,
}) => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [selectedTurnId, setSelectedTurnId] = useState<string | null>(null);
  const [selectedTurn, setSelectedTurn] = useState<any>(null);
  const [actionType, setActionType] = useState<"cancel" | "start" | "return">("cancel");
  const router = useRouter();

  const fetchTurns = async () => {
    try {
      const response: any = await httpRequest({
        method: 'GET',
        url: `/shift/branch/${branchOfficeId}`,
        requiresAuth: true,
      });
      
      setTurns(response.data.map((shift: any) => ({
        id: shift.shiftId.toString(),
        name: `${shift.person.firstName} ${shift.person.lastName}`,
        statusAppointment: shift.appointment.statusAppointment,
        shiftAppointmentId: shift.shiftAppointmentId,
        shiftPersonId: shift.shiftPersonId,
        ...shift
      })));
    } catch (error) {
      console.error("Error fetching turns:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (open) {
      fetchTurns();
    }
  }, [open, branchOfficeId]);

  const handleConfirmAction = async () => {
    if (!selectedTurnId) return;
    try {
      switch(actionType) {
        case "cancel":
          await httpRequest({
            method: "DELETE",
            url: `/shift/${selectedTurnId}`,
            requiresAuth: true,
          });
          break;
        case "start":
          await httpRequest({
            method: "POST",
            url: `/shift/${branchOfficeId}/start/${selectedTurnId}`,
            requiresAuth: true,
          });
          break;
        case "return":
          await httpRequest({
            method: "POST",
            url: `/shift/${branchOfficeId}/confirmed/${selectedTurnId}`,
            requiresAuth: true,
          });
          break;
      }
      await fetchTurns();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setConfirmOpen(false);
      setSelectedTurnId(null);
    }
  };

  const handleHistoryAccess = (turn: Turn) => {
    router.push(
      `/medical-history/${turn.shiftAppointmentId}/${turn.shiftPersonId}/${turn.shiftPersonId}?isConsult=true&turnId=${turn.id}`
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            p: 3,
            borderRadius: 2,
            boxShadow: 3,
            background: "linear-gradient(135deg, #ffffff, #f2f2f2)",
          },
        }}
      >
        <DialogTitle
          sx={{ textAlign: "center", fontWeight: 600, position: "relative" }}
        >
          Turnos de Pacientes
          <IconButton
            aria-label="cerrar"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8, color: "grey.600" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              minHeight: 200,
              p: 1,
              backgroundColor: "#f9f9f9",
              borderRadius: 1,
            }}
          >
            {loading ? (
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                Cargando turnos...
              </Typography>
            ) : (
              turns.map((turn) => (
                <Box
                  key={turn.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    boxShadow: 2,
                    transition: "all 0.3s ease",
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <DragIndicatorIcon sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography
                    variant="body1"
                    sx={{ color: "text.primary", flexGrow: 1 }}
                  >
                    {turn.name}
                  </Typography>
                  
                  {turn.statusAppointment === 'IN' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleHistoryAccess(turn)}
                      >
                        Acceder a la consulta
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                          setSelectedTurnId(turn.id);
                          setActionType("return");
                          setConfirmOpen(true);
                        }}
                      >
                        Retornar a Confirmada
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setSelectedTurnId(turn.id);
                          setActionType("start");
                          setConfirmOpen(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        Iniciar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setSelectedTurnId(turn.id);
                          setActionType("cancel");
                          setConfirmOpen(true);
                        }}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          {actionType === "cancel" && "Confirmar Cancelación"}
          {actionType === "start" && "Confirmar Inicio de Turno"}
          {actionType === "return" && "Retornar a Estado Confirmado"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {actionType === "cancel" && "¿Estás seguro de cancelar este turno?"}
            {actionType === "start" && "¿Estás seguro de iniciar este turno?"}
            {actionType === "return" && "¿Retornar este turno al estado confirmado?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            No
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={
              actionType === "cancel" ? "error" : 
              actionType === "return" ? "secondary" : "primary"
            }
            variant="contained"
          >
            {actionType === "cancel" && "Sí, Cancelar"}
            {actionType === "start" && "Sí, Iniciar"}
            {actionType === "return" && "Sí, Retornar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewTurnsModal;