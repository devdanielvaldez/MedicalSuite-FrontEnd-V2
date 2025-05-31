"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Fab,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { httpRequest } from "@/app/utils/http";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AddIcon from "@mui/icons-material/Add";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

enum AccountingType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  marginBottom: theme.spacing(3),
}));

const AccountingAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
  marginBottom: theme.spacing(2),
  "&:before": { display: "none" },
}));

const MonthAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  '&.Mui-expanded': {
    margin: theme.spacing(2, 0),
  },
  "&:before": { display: "none" },
}));

const typeColors: any = {
  [AccountingType.INCOME]: "success",
  [AccountingType.EXPENSE]: "error",
};

const typeTranslations: any = {
  [AccountingType.INCOME]: "Ingresos",
  [AccountingType.EXPENSE]: "Gastos",
};

export default function AccountingPage() {
  const [accountingEntries, setAccountingEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchOfficeId, setBranchOfficeId] = useState<number | null>(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    date: new Date(),
  });

  useEffect(() => {
    const storedBranch = localStorage.getItem("selectedBranchOffice");
    if (storedBranch) {
      setBranchOfficeId(parseInt(storedBranch));
    }
    loadAccounting();
  }, []);

  const loadAccounting = async () => {
    try {
      setLoading(true);
      const response: any = await httpRequest({
        url: "/accounting",
        method: "GET",
        requiresAuth: true,
      });

      if (response) {
        setAccountingEntries(response);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar la contabilidad");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterExpense = async () => {
    try {
      if (!branchOfficeId) {
        throw new Error("No se ha seleccionado una sucursal");
      }

      await httpRequest({
        url: "/accounting",
        method: "POST",
        data: {
          type: "EXPENSE",
          amount: parseFloat(newExpense.amount),
          description: newExpense.description,
          branchOfficeId: branchOfficeId,
          date: newExpense.date.toISOString(),
        },
        requiresAuth: true,
      });

      await loadAccounting();
      setExpenseModalOpen(false);
      setNewExpense({ amount: "", description: "", date: new Date() });
    } catch (err: any) {
      setError(err.message || "Error al registrar el gasto");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupByTypeAndMonth = () => {
    return accountingEntries.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const monthYear = date.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric"
      }).toUpperCase();
      
      if (!acc[entry.type]) {
        acc[entry.type] = {
          total: 0,
          months: {}
        };
      }
      
      if (!acc[entry.type].months[monthYear]) {
        acc[entry.type].months[monthYear] = {
          total: 0,
          entries: []
        };
      }
      
      acc[entry.type].total += entry.amount;
      acc[entry.type].months[monthYear].total += entry.amount;
      acc[entry.type].months[monthYear].entries.push(entry);
      
      return acc;
    }, {} as any);
  };

  const groupedData = groupByTypeAndMonth();

  return (
    <DashboardCard
      title="Registro Contable"
      action={
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={`Total registros: ${accountingEntries.length}`}
            color="primary"
            variant="outlined"
          />
          <Fab
            color="primary"
            variant="extended"
            onClick={() => setExpenseModalOpen(true)}
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
          >
            <AddIcon sx={{ mr: 1 }} />
            Registrar Gasto
          </Fab>
        </Box>
      }
    >
      <>
        <Dialog
          open={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3} pt={2}>
              <TextField
                label="Monto"
                type="number"
                fullWidth
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
                InputProps={{
                  startAdornment: <Typography>RD$</Typography>,
                }}
              />

              <TextField
                label="Descripción"
                multiline
                rows={3}
                fullWidth
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, description: e.target.value })
                }
              />

              <FormControl fullWidth>
                <InputLabel shrink>Fecha del gasto</InputLabel>
                <DatePicker
                  selected={newExpense.date}
                  onChange={(date: any) =>
                    setNewExpense({ ...newExpense, date: date })
                  }
                  dateFormat="dd/MM/yyyy HH:mm"
                  showTimeInput
                  customInput={
                    <TextField
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  }
                />
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExpenseModalOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleRegisterExpense}
              disabled={!newExpense.amount || !newExpense.description}
            >
              Registrar Gasto
            </Button>
          </DialogActions>
        </Dialog>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <StyledPaper>
            {accountingEntries.length === 0 ? (
              <Alert severity="info">No hay registros contables</Alert>
            ) : (
              Object.entries(groupedData).map(([type, data]: any) => (
                <Box key={type} mb={4}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <ReceiptIcon color="action" />
                    <Typography variant="h5">
                      {typeTranslations[type]}
                    </Typography>
                    <Chip
                      label={`Total: RD$${data.total.toFixed(2)}`}
                      color={typeColors[type]}
                      variant="filled"
                    />
                  </Box>

                  {Object.entries(data.months).map(([monthYear, monthData]: any) => (
                    <MonthAccordion key={monthYear}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{monthYear}</Typography>
                          <Chip
                            label={`RD$${monthData.total.toFixed(2)}`}
                            color={typeColors[type]}
                            variant="outlined"
                          />
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails>
                        {monthData.entries.map((entry: any) => (
                          <AccountingAccordion key={entry.id}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box width="100%" display="flex" justifyContent="space-between">
                                <Box>
                                  <Typography fontWeight={500}>
                                    {formatDate(entry.date)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {entry.description}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={`RD$${entry.amount.toFixed(2)}`}
                                  color={typeColors[type]}
                                />
                              </Box>
                            </AccordionSummary>

                            <AccordionDetails>
                              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3}>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Sucursal
                                  </Typography>
                                  <Typography>
                                    {entry.branchOffice?.nameBranchOffice || "N/A"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Fecha registro
                                  </Typography>
                                  <Typography>
                                    {formatDate(entry.createdAt)}
                                  </Typography>
                                </Box>
                              </Box>
                            </AccordionDetails>
                          </AccountingAccordion>
                        ))}
                      </AccordionDetails>
                    </MonthAccordion>
                  ))}
                </Box>
              ))
            )}
          </StyledPaper>
        )}
      </>
    </DashboardCard>
  );
}