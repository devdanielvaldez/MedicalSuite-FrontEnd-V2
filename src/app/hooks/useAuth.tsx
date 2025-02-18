'use client';

import React, { useEffect, useState, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { keyframes, styled } from '@mui/material';

// Definimos la animación de "pulse"
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Contenedor centrado para el loader
const LoaderContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  width: '100%',
});

// Componente que aplica la animación "pulse" al logo
const AnimatedLogo = styled('div')({
  animation: `${pulse} 1.5s ease-in-out infinite`,
});

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthenticatedComponent = (props: P) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessTokenMedicalSuite');

        if (!token) {
          router.push('/auth/login');
        } else {
          setLoading(false);
        }
      }
    }, [router]);

    if (loading) {
      return (
        <LoaderContainer>
          <AnimatedLogo>
            <Image src="/images/logos/logo.png" alt="Logo" width={340} height={100} />
          </AnimatedLogo>
        </LoaderContainer>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuth;