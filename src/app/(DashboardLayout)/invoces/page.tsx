"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { httpRequest } from "@/app/utils/http";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SavingsIcon from "@mui/icons-material/Savings";

enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED'
}

const PaymentMethod: any = {
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  TRANSFER: 'TRANSFER'
}

enum PaymentMethodEnum {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  TRANSFER = 'TRANSFER'
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  marginBottom: theme.spacing(3),
}));

const InvoiceAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
  marginBottom: theme.spacing(2),
  "&:before": { display: "none" },
}));

const statusColors = {
  [InvoiceStatus.PENDING]: "warning",
  [InvoiceStatus.PAID]: "success",
  [InvoiceStatus.PARTIAL]: "info",
  [InvoiceStatus.CANCELLED]: "error",
} as const;

const statusTranslations: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PENDING]: "Pendientes",
  [InvoiceStatus.PAID]: "Pagadas",
  [InvoiceStatus.PARTIAL]: "Parciales",
  [InvoiceStatus.CANCELLED]: "Canceladas"
};

interface InsuranceItem {
  serviceId: number;
  serviceName: string;
  subtotal: number;
  insuranceCoverage: number;
  maxCoverage: number;
}

export default function InvoiceManagement() {
  const [activeTab, setActiveTab] = useState<InvoiceStatus>(InvoiceStatus.PENDING);
  const [invoices, setInvoices] = useState<Record<InvoiceStatus, any[]>>({
    PENDING: [],
    PAID: [],
    PARTIAL: [],
    CANCELLED: [],
  });
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [insuranceData, setInsuranceData] = useState<InsuranceItem[]>([]);
  const [authorizationNumber, setAuthorizationNumber] = useState("");
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: PaymentMethod.CASH,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchOfficeId, setBranchOfficeId] = useState<number | null>(null);

  useEffect(() => {
    const loadBranch = async () => {
      const storedBranch = localStorage.getItem("selectedBranchOffice");
      if (storedBranch) {
        setBranchOfficeId(parseInt(storedBranch));
        await loadInvoices(parseInt(storedBranch));
      }
    };
    loadBranch();
  }, []);

  const sanitizeInvoices = (invoices: any[]) => 
    invoices.map(invoice => ({
      ...invoice,
      total: parseFloat(invoice.total) || 0,
      items: invoice.items.map((item: any) => ({
        ...item,
        subtotal: parseFloat(item.subtotal) || 0,
        insuranceCoverage: parseFloat(item.insuranceCoverage) || 0,
        price: parseFloat(item.price) || 0
      })),
      payments: invoice.payments.map((payment: any) => ({
        ...payment,
        amount: parseFloat(payment.amount) || 0
      }))
    }));

  const loadInvoices = async (branchId: number) => {
    try {
      setLoading(true);
      const response: any = await httpRequest({
        url: `/invoices/branch/${branchId}`,
        method: "GET",
        requiresAuth: true,
      });

      setInvoices({
        PENDING: sanitizeInvoices(response.PENDING || []),
        PAID: sanitizeInvoices(response.PAID || []),
        PARTIAL: sanitizeInvoices(response.PARTIAL || []),
        CANCELLED: sanitizeInvoices(response.CANCELLED || [])
      });
    } catch (err: any) {
      setError(err.message || "Error al cargar facturas");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    try {
      if (!selectedInvoice || !paymentData.amount || !branchOfficeId) return;
      await httpRequest({
        url: `/invoices/${selectedInvoice.id}/payments`,
        method: "POST",
        data: {
          amount: Number(paymentData.amount),
          method: paymentData.paymentMethod,
          paymentDate: new Date().toISOString(),
          invoceStatus: selectedInvoice.total == +paymentData.amount ? 'PAID' : 'PARTIAL',
          status: selectedInvoice.total == +paymentData.amount ? 'PAID' : 'PARTIAL'
        },
        requiresAuth: true,
      });

      await httpRequest({
        url: "/accounting",
        method: "POST",
        data: {
          type: "INCOME",
          amount: Number(paymentData.amount),
          description: `Pago factura #${selectedInvoice.id}`,
          branchOfficeId: branchOfficeId,
          date: new Date().toISOString()
        },
        requiresAuth: true,
      });

      await loadInvoices(branchOfficeId);
      setPaymentModalOpen(false);
      setPaymentData({ amount: "", paymentMethod: PaymentMethod.CASH });
    } catch (err: any) {
      setError(err.message || "Error al registrar pago");
    }
  };

  const handleAddInsurance = async () => {
    try {
      if (!selectedInvoice || !authorizationNumber) return;

      await httpRequest({
        url: `/invoices/${selectedInvoice.id}/insurance/items`,
        method: "PATCH",
        data: {
          items: insuranceData.map(item => ({
            serviceId: item.serviceId,
            coverage: +item.insuranceCoverage
          })),
          authorizationNumber
        },
        requiresAuth: true,
      });

      await loadInvoices(branchOfficeId!);
      setInsuranceModalOpen(false);
      setAuthorizationNumber("");
    } catch (err: any) {
      setError(err.message || "Error al registrar cobertura");
    }
  };

  const calculateInvoiceBalance = (invoice: any) => {
    const totalPaid = invoice.payments.reduce(
      (sum: number, payment: any) => sum + payment.amount,
      0
    );
    return invoice.total - totalPaid;
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return "RD$0.00";
    
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount);
  };

  const handleOpenInsurance = (invoice: any) => {
    setSelectedInvoice(invoice);
    setInsuranceData(
      invoice.items.map((item: any) => ({
        serviceId: item.serviceId,
        serviceName: item.service.name,
        subtotal: item.subtotal,
        insuranceCoverage: +item.insuranceCoverage || 0,
        maxCoverage: item.subtotal - (+item.insuranceCoverage || 0)
      }))
    );
    setInsuranceModalOpen(true);
  };

  return (
    <DashboardCard
      title="Gestión de Facturas"
      action={
        <Chip
          label={`Sucursal: ${branchOfficeId || "No seleccionada"}`}
          color="primary"
          variant="outlined"
        />
      }
    >
      <>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          sx={{ mb: 3 }}
        >
          {Object.values(InvoiceStatus).map((status) => (
            <Tab
              key={status}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={invoices[status].length}
                    size="small"
                    color={statusColors[status]}
                  />
                  {statusTranslations[status]}
                </Box>
              }
              value={status}
            />
          ))}
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          Object.entries(invoices).map(([status, invoicesList]) =>
            activeTab === status && (
              <StyledPaper key={status}>
                {invoicesList.length === 0 ? (
                  <Alert severity="info">No hay facturas en este estado</Alert>
                ) : (
                  invoicesList.map((invoice) => {
                    const balance = calculateInvoiceBalance(invoice);
                    const totalCoverage = invoice.items.reduce(
                      (sum: number, item: any) => sum + item.insuranceCoverage,
                      0
                    );

                    return (
                      <InvoiceAccordion key={invoice.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box width="100%" display="flex" justifyContent="space-between">
                            <Box>
                              <Typography fontWeight={600}>
                                {invoice.appointment.person.firstName}{" "}
                                {invoice.appointment.person.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(invoice.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            
                            <Box display="flex" gap={2} alignItems="center">
                              <Chip
                                label={formatCurrency(invoice.total)}
                                color="default"
                                variant="outlined"
                              />
                              {totalCoverage > 0 && (
                                <Chip
                                  label={`Cobertura: ${formatCurrency(totalCoverage)}`}
                                  color="info"
                                />
                              )}
                              {status !== InvoiceStatus.PAID && (
                                <Chip
                                  label={`Saldo: ${formatCurrency(balance)}`}
                                  color={balance > 0 ? "warning" : "success"}
                                />
                              )}
                            </Box>
                          </Box>
                        </AccordionSummary>

                        <AccordionDetails>
                          <Box display="flex" gap={2} flexDirection="column">
                            <Box display="flex" gap={2} flexWrap="wrap">
                              <Button
                                variant="outlined"
                                startIcon={<ReceiptIcon />}
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setDetailsModalOpen(true);
                                }}
                              >
                                Detalles
                              </Button>

                              {invoice.appointment.isWithInsurance && (
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  startIcon={<SavingsIcon />}
                                  onClick={() => handleOpenInsurance(invoice)}
                                >
                                  Cobertura
                                </Button>
                              )}

                              {status !== InvoiceStatus.PAID && (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<PaymentIcon />}
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setPaymentModalOpen(true);
                                  }}
                                >
                                  Registrar Pago
                                </Button>
                              )}
                            </Box>

                            {invoice.payments.length > 0 && (
                              <Box>
                                <Typography variant="subtitle2" mb={1}>
                                  Historial de Pagos:
                                </Typography>
                                {invoice.payments.map((payment: any) => (
                                  <Box
                                    key={payment.id}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    p={1}
                                    bgcolor="action.hover"
                                    borderRadius={1}
                                    mb={1}
                                  >
                                    <Typography variant="body2">
                                      {new Date(payment.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography>
                                      {formatCurrency(payment.amount)} ({PaymentMethod[payment.method]})
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </AccordionDetails>
                      </InvoiceAccordion>
                    );
                  })
                )}
              </StyledPaper>
            )
          )
        )}

        {/* Modal de Cobertura */}
        <Dialog
          open={insuranceModalOpen}
          onClose={() => setInsuranceModalOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Registro de Cobertura por Servicio</DialogTitle>
          <DialogContent>
            <Box py={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Número de Autorización"
                    fullWidth
                    value={authorizationNumber}
                    onChange={(e) => setAuthorizationNumber(e.target.value)}
                    required
                  />
                </Grid>
                
                {insuranceData.map((item, index) => (
                  <Grid item xs={12} key={item.serviceId}>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="subtitle1">{item.serviceName}</Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <TextField
                          label="Monto de cobertura"
                          type="number"
                          fullWidth
                          value={+item.insuranceCoverage}
                          onChange={(e) => {
                            const newData = [...insuranceData];
                            newData[index].insuranceCoverage = Math.min(
                              Number(e.target.value),
                              item.maxCoverage + +item.insuranceCoverage
                            );
                            setInsuranceData(newData);
                          }}
                          InputProps={{
                            startAdornment: <Typography>RD$</Typography>,
                            inputProps: {
                              min: 0,
                              max: item.maxCoverage + +item.insuranceCoverage
                            }
                          }}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">
                          Subtotal: {formatCurrency(item.subtotal)}
                        </Typography>
                        <Typography variant="body2">
                          Cobertura total: {formatCurrency(+item.insuranceCoverage)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setInsuranceModalOpen(false);
              setAuthorizationNumber("");
            }}>Cancelar</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddInsurance}
              disabled={!authorizationNumber}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Pagos */}
        <Dialog
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogContent>
            <Box py={2} display="flex" flexDirection="column" gap={3}>
              <TextField
                label="Monto"
                type="number"
                fullWidth
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                InputProps={{
                  startAdornment: <Typography>RD$</Typography>,
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Método de Pago</InputLabel>
                <Select
                  value={paymentData.paymentMethod}
                  label="Método de Pago"
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  {Object.values(PaymentMethodEnum).map((method) => (
                    <MenuItem key={method} value={method}>
                      {method.replace("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentModalOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddPayment}
              disabled={!paymentData.amount}
            >
              Registrar Pago
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Detalles */}
        <Dialog
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Detalles de Factura</DialogTitle>
          <DialogContent>
            {selectedInvoice && (
              <Box py={2}>
                <Typography variant="h6" mb={2}>Servicios:</Typography>
                <Grid container spacing={2}>
                  {selectedInvoice.items.map((item: any) => (
                    <Grid item xs={12} key={item.id}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        p={1}
                        bgcolor="action.hover"
                        borderRadius={1}
                      >
                        <Box>
                          <Typography>{item.service.name}</Typography>
                          {item.insuranceCoverage > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              Cobertura: {formatCurrency(item.insuranceCoverage)}
                            </Typography>
                          )}
                        </Box>
                        <Typography>
                          {item.quantity} x {formatCurrency(item.price)} ={" "}
                          {formatCurrency(item.subtotal)}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box mt={4}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Subtotal:</Typography>
                          <Typography>
                            {formatCurrency(
                              selectedInvoice.items.reduce(
                                (sum: number, item: any) => sum + item.subtotal,
                                0
                              )
                            )}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Descuento:</Typography>
                          <Typography color="error">
                            -{formatCurrency(selectedInvoice.discount)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Cobertura total:</Typography>
                          <Typography color="info.main">
                            -{formatCurrency(
                              selectedInvoice.items.reduce(
                                (sum: number, item: any) => sum + (item.insuranceCoverage || 0),
                                0
                              )
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        p={2}
                        bgcolor="background.default"
                        borderRadius={1}
                      >
                        <Typography variant="h6">Total:</Typography>
                        <Typography variant="h6">
                          {formatCurrency(selectedInvoice.total)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </>
    </DashboardCard>
  );
}