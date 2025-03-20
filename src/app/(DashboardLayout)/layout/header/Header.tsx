'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PropTypes from 'prop-types';

import Profile from './Profile';
import { IconBellRinging, IconMenu } from '@tabler/icons-react';
import { httpRequest } from '@/app/utils/http';

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  const [branchOffices, setBranchOffices] = useState<any[]>([]);
  const [selectedBranchOffice, setSelectedBranchOffice] = useState<string>('');

  useEffect(() => {
    async function fetchBranchOffices() {
      try {
        const response: any = await httpRequest({
          method: 'GET',
          url: '/branch-office/get-all-by-doctor',
          requiresAuth: true,
        });
        const activeOffices = response;
        setBranchOffices(activeOffices);
        const storedValue = localStorage.getItem("selectedBranchOffice");
        if (storedValue && activeOffices.some((bo: any) => bo.branchOfficeId.toString() === storedValue)) {
          setSelectedBranchOffice(storedValue);
        } else if (activeOffices.length > 0) {
          setSelectedBranchOffice(activeOffices[0].branchOfficeId.toString());
          localStorage.setItem("selectedBranchOffice", activeOffices[0].branchOfficeId.toString());
        }
      } catch (error) {
        console.error("Error fetching branch offices:", error);
      }
    }
    fetchBranchOffices();
  }, []);

  const handleBranchChange = (e: any) => {
    const newValue = e.target.value as string;
    setSelectedBranchOffice(newValue);
    localStorage.setItem("selectedBranchOffice", newValue);
    location.reload();
  };

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <IconButton
          size="large"
          aria-label="show 11 new notifications"
          color="inherit"
          aria-controls="msgs-menu"
          aria-haspopup="true"
        >
          <Badge variant="dot" color="primary">
            <IconBellRinging size="21" stroke="1.5" />
          </Badge>
        </IconButton>
        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          <FormControl variant="outlined" size="small" sx={{ minWidth: 250 }}>
            <InputLabel id="branch-office-select-label">Consultorio</InputLabel>
            <Select
              labelId="branch-office-select-label"
              value={selectedBranchOffice}
              onChange={handleBranchChange}
              label="Consultorio"
              fullWidth
            >
              {branchOffices.map((bo) => (
                <MenuItem key={bo.branchOfficeId} value={bo.branchOfficeId.toString()}>
                  {bo.nameBranchOffice}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;