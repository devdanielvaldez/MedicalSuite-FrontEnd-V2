'use client';

import React, { useState } from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";

import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import { toast, ToastContainer } from "react-toastify";
import { httpRequest } from "@/app/utils/http";
import { prisma } from "@/app/lib/prisma";
import { useRouter } from "next/navigation";

interface LoginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthLogin = ({ title, subtitle, subtext }: LoginType) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const _submitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('entro', username, password);

    if (username === "" || password === "") {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      toast.error("Por favor, ingresa un correo electrónico válido");
      return;
    }

    console.log("Enviando login con:", { username, password });
    setLoading(true);
    httpRequest({
      method: 'POST',
      url: '/authentication/log-in',
      data: { email: username, password },
    })
      .then(async (res: any) => {
        console.log(res);
        localStorage.setItem('accessTokenMedicalSuite', res.tokens.accessToken);
        localStorage.setItem('refreshTokenMedicalSuite', res.tokens.refreshToken);
        localStorage.setItem('personId', res.user.userPersonId);
        if(res.user.isDoctor) localStorage.setItem('doctorId', res.user.userDoctorId);
        localStorage.setItem("userId", res.user.userId);
        router.push('/appointments');
      })
      .catch((err) => {
        // console.log(err);
        toast.error(err.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form onSubmit={_submitLogin}>
      <ToastContainer />
      {title && (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      )}

      {subtext}

      <Stack spacing={2}>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="username"
            mb="5px"
          >
            Usuario
          </Typography>
          <CustomTextField
            id="username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e: any) => setUsername(e.target.value)}
          />
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="password"
            mb="5px"
          >
            Contraseña
          </Typography>
          <CustomTextField
            id="password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
          />
        </Box>
        <Stack
          justifyContent="space-between"
          direction="row"
          alignItems="center"
          my={2}
        >
          <FormGroup>
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Recordar este dispositivo"
            />
          </FormGroup>
          <Typography
            component={Link}
            href="/"
            fontWeight="500"
            sx={{
              textDecoration: "none",
              color: "primary.main",
            }}
          >
            ¿Olvidaste tu contraseña?
          </Typography>
        </Stack>
      </Stack>
      <Box mt={2}>
        <Button
          type="submit"
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Iniciar"}
        </Button>
      </Box>
      {subtitle}
    </form>
  );
};

export default AuthLogin;