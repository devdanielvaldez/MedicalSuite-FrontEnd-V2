import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
  IconCalendarBolt,
  IconUserBolt,
  IconCalendarCheck,
  IconCalendarOff,
  IconMist,
  IconId,
  IconCircle,
  IconCheck,
  IconCashBanknote,
  IconFileAnalytics,
  IconCurrencyDollar,
  IconArrowDown,
  IconBuilding,
  IconUsersGroup,
  IconSettings,
  IconTemplate
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Inicio",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "Pacientes",
  },
  {
    id: uniqueId(),
    title: "Citas",
    icon: IconCalendarCheck,
    href: "/appointments",
  },
  {
    id: uniqueId(),
    title: "Pacientes",
    icon: IconUserBolt,
    href: "/patients",
  },
  {
    id: uniqueId(),
    title: "Resultados",
    icon: IconFileAnalytics,
    href: "/patients-results",
  },

  {
    navlabel: true,
    subheader: "Consultorio",
  },
  {
    id: uniqueId(),
    title: "Consultorios",
    icon: IconBuilding,
    href: "/branch-office",
  },
  {
    id: uniqueId(),
    title: "Dias Laborables",
    icon: IconCalendarBolt,
    href: "/available-work-days",
  },
  {
    id: uniqueId(),
    title: "Bloqueo de Fechas",
    icon: IconCalendarOff,
    href: "/block-dates",
  },
  {
    id: uniqueId(),
    title: "Servicios",
    icon: IconMist,
    href: "/services",
  },

  {
    navlabel: true,
    subheader: "Aseguradoras",
  },
  {
    id: uniqueId(),
    title: "Mis ARS",
    icon: IconId,
    href: "/my-ars",
  },
  {
    id: uniqueId(),
    title: "Autorizaciones",
    icon: IconCheck,
    href: "/ars-authorizations",
  },
  {
    id: uniqueId(),
    title: "Seguimiento de Pagos",
    icon: IconCashBanknote,
    href: "/ars-payments",
  },

  {
    navlabel: true,
    subheader: "Reportes",
  },
  {
    id: uniqueId(),
    title: "Ingresos",
    icon: IconCurrencyDollar,
    href: "/incomes",
  },
  {
    id: uniqueId(),
    title: "Gastos",
    icon: IconArrowDown,
    href: "/bills",
  },

  {
    navlabel: true,
    subheader: "Configuración",
  },
  {
    id: uniqueId(),
    title: "Plantillas",
    icon: IconTemplate,
    href: "/templates",
  },
  {
    id: uniqueId(),
    title: "Usuarios",
    icon: IconUsersGroup,
    href: "/users",
  },
  {
    id: uniqueId(),
    title: "Parametros",
    icon: IconSettings,
    href: "/params",
  },
];

export default Menuitems;
