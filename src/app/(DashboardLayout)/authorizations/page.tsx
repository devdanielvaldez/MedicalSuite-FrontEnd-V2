'use client';

import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Assignment as PolicyIcon,
  LocalHospital as InsuranceIcon,
  Receipt as InvoiceIcon,
  DateRange as DateIcon,
  ReceiptOutlined as ReceiptIcon,
  CalendarMonth as MonthIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { httpRequest } from '@/app/utils/http';

const ModernPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)'
  }
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  margin: '8px 0',
  borderRadius: '12px !important',
  '&:before': { display: 'none' },
  '&.Mui-expanded': {
    margin: '8px 0',
    boxShadow: theme.shadows[2]
  }
}));

const HeaderChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.9rem',
  padding: theme.spacing(1),
  borderRadius: '8px',
  background: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.15)
  }
}));

const MonthHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  background: alpha(theme.palette.primary.main, 0.05),
  borderRadius: '12px',
  marginBottom: theme.spacing(2)
}));

const AuthorizationList = () => {
  const theme = useTheme();
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchOfficeId, setBranchOfficeId] = useState<number | null>(null);

  useEffect(() => {
    const loadAuthorizations = async () => {
      try {
        const storedBranch = localStorage.getItem("selectedBranchOffice");
        if (!storedBranch) throw new Error('No se ha seleccionado una sucursal');
        
        const branchId = parseInt(storedBranch);
        setBranchOfficeId(branchId);

        const response: any = await httpRequest({
          url: `/invoices/authorization/${branchId}`,
          method: "GET",
          requiresAuth: true,
        });

        setAuthorizations(response);
      } catch (err: any) {
        setError(err.message || 'Error al cargar autorizaciones');
      } finally {
        setLoading(false);
      }
    };

    loadAuthorizations();
  }, []);

  const groupByMonthYear = authorizations.reduce((acc: any, auth: any) => {
    const date = new Date(auth.effectiveDate);
    const monthYear = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    }).toUpperCase();
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        totalCoverage: 0,
        authorizations: [],
        insurances: new Map()
      };
    }
    
    const authCoverage = auth.invoice?.items?.reduce((sum: any, item: any) => 
      sum + (Number(item.insuranceCoverage) || 0), 0) || 0;
    
    // Agrupar por aseguradora
    const insuranceName = auth.insurancePerson?.insurance?.insuranceName || 'Sin Seguro';
    if (!acc[monthYear].insurances.has(insuranceName)) {
      acc[monthYear].insurances.set(insuranceName, {
        totalCoverage: 0,
        authorizations: [],
        color: auth.insurancePerson?.insurance?.color || theme.palette.primary.main
      });
    }
    
    const insuranceData = acc[monthYear].insurances.get(insuranceName);
    insuranceData.totalCoverage += authCoverage;
    insuranceData.authorizations.push({...auth, authCoverage});
    
    // Actualizar totales
    acc[monthYear].totalCoverage += authCoverage;
    
    return acc;
  }, {});

  const formatCurrency = (amount: any) => 
    new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2
    }).format(amount || 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.light }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2, borderRadius: '12px' }}>
        {error}
      </Alert>
    );
  }

  return (
    <ModernPaper>
      <Box display="flex" alignItems="center" mb={4}>
        <InsuranceIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
        <Typography variant="h5" fontWeight="600">
          Autorizaciones
        </Typography>
      </Box>

      {Object.entries(groupByMonthYear).map(([monthYear, data]: any) => (
        <Box key={monthYear} mb={4}>
          <MonthHeader>
            <MonthIcon fontSize="large" color="primary" />
            <Typography variant="h6" fontWeight="600">
              {monthYear}
            </Typography>
            <HeaderChip 
              label={`Cobertura Total: ${formatCurrency(data.totalCoverage)}`}
            />
          </MonthHeader>

          {Array.from(data.insurances.entries()).map(([insuranceName, insuranceData]: any) => (
            <StyledAccordion key={insuranceName}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box width="100%" display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: insuranceData.color, width: 32, height: 32 }}>
                    <PolicyIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="h6">{insuranceName}</Typography>
                  <Chip
                    label={formatCurrency(insuranceData.totalCoverage)}
                    sx={{ 
                      background: alpha(insuranceData.color, 0.1),
                      color: insuranceData.color,
                      border: `1px solid ${alpha(insuranceData.color, 0.2)}`
                    }}
                  />
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                {insuranceData.authorizations.map((auth: any) => (
                  <Box key={auth.authorizationId} mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DateIcon color="action" />
                        <Typography variant="subtitle1" fontWeight="500">
                          {new Date(auth.effectiveDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        #{auth.authorizationNumber}
                      </Typography>
                    </Box>

                    <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                      <Chip
                        icon={<PersonIcon />}
                        label={`${auth.insurancePerson?.person?.firstName} ${auth.insurancePerson?.person?.lastName}`}
                        variant="outlined"
                        sx={{ borderRadius: '6px' }}
                      />
                      <Chip
                        icon={<PolicyIcon />}
                        label={`Póliza: ${auth.insurancePerson?.policyNumber}`}
                        variant="outlined"
                        sx={{ borderRadius: '6px' }}
                      />
                    </Box>

                    {auth.invoice && (
                      <Box 
                        sx={{ 
                          background: theme.palette.grey[100], 
                          borderRadius: '8px', 
                          p: 2,
                          mt: 2
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <InvoiceIcon fontSize="small" color="action" />
                          <Typography variant="subtitle2" fontWeight="500">
                            Factura #{auth.invoice.id}
                          </Typography>
                          <Chip
                            label={formatCurrency(auth.authCoverage)}
                            size="small"
                            sx={{ 
                              background: theme.palette.success.dark,
                              color: theme.palette.success.contrastText
                            }}
                          />
                        </Box>
                        <Box display="flex" gap={3}>
                          <Typography variant="body2">
                            Total: {formatCurrency(auth.invoice.total)}
                          </Typography>
                          <Typography variant="body2">
                            Servicios: {auth.invoice.items?.length || 0}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    <Divider sx={{ mt: 2, borderStyle: 'dashed' }} />
                  </Box>
                ))}
              </AccordionDetails>
            </StyledAccordion>
          ))}
        </Box>
      ))}
    </ModernPaper>
  );
};

export default AuthorizationList;