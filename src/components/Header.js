'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, MenuItem, Container, Avatar, Button, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AdbIcon from '@mui/icons-material/Adb';
import axios from 'axios';
const guestSettings = ['Login'];

function Header() {
    const router = useRouter();
    const pathname = usePathname()
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [data, setData] = useState("");
    const [showMyEvent, setShowMyEvent] = useState(false);
    const [userType, setUserType] = useState(null);
    const [renderHeader, setRenderHeader] = useState(true);
    const [authSettings, setAuthSettings] = useState(['Preference', 'Dashboard', 'Logout']);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const storedUserType = localStorage.getItem('role');
        const first_name = localStorage.getItem('first_name');
        const last_name = localStorage.getItem('last_name');
        const profile_image = localStorage.getItem('profile_image');
        setData({
            first_name: first_name || '',
            last_name: last_name || '',
            profile_image: profile_image || ''
        });
        const isAuth = !!token;
        setIsAuthenticated(isAuth);
        setUserType(storedUserType);
        setShowMyEvent(storedUserType && storedUserType !== '2');
        const noHeaderRoutes = ['/forgotPassword', '/verify', '/signup', '/login', '/paymentsuccess', "/"];
        setRenderHeader(!noHeaderRoutes.includes(pathname));
        if (storedUserType === '1') {
            setAuthSettings(['Dashboard', 'Profile', 'Logout']);
        } else {
            setAuthSettings(['Dashboard', 'Profile', 'Wallet', 'Logout',]);
        }
    }, [pathname]);
    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = (page) => {
        setAnchorElNav(null);
        if (page) {
            router.push(`/${page.toLowerCase().replace(' ', '')}`)
        }
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleMenuClick = (setting) => {
        handleCloseUserMenu();
        switch (setting) {
            case 'Dashboard':
                router.push('/dashboard');
                break;
            case 'Profile':
                router.push('/profile');
                break;
            case 'Wallet':
                router.push('/wallet');
                break;
            case 'Logout':
                handleLogout();
                break;
            case 'Login':
                router.push('/login');
                break;
            default:
                break;
        }
    };

    const handleLogout = () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            axios.post('https://api.socihubout.site/api/v1/users/logout/', { token }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    alert('Logout successful', response.data.message);
                    localStorage.clear();
                    setIsAuthenticated(false);
                    router.push('/login');
                })
                .catch(error => {
                    if (error.response && error?.response?.data?.meta?.code === 401) {
                        // If the API returns a 401 error, clear the localStorage and redirect to login page
                        localStorage.clear();
                        setIsAuthenticated(false);
                        router.push('/login');
                    } else {
                        console.error('Logout failed', error);
                    }
                });
        }
    };
    if (!renderHeader) {
        return null; // Do not render the header on specified routes
    }
    return (
        <AppBar position="static" sx={{ backgroundColor: '#272727', color: '#fff' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/dashboard"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        SOCIHUBOUT
                    </Typography>

                    {userType !== '2' && (
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}
                            >
                                {showMyEvent && (
                                    <MenuItem onClick={() => handleCloseNavMenu('My Event')}>
                                        <Typography textAlign="center">My Event</Typography>
                                    </MenuItem>
                                )}
                            </Menu>
                        </Box>
                    )}
                    <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="/dashboard"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        SOCIHUBOUT
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {showMyEvent && (
                            <Button
                                key="My Event"
                                onClick={() => handleCloseNavMenu('My Event')}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                My Event
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="User Avatar" src={data.profile_image ? data.profile_image : ''} />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {(isAuthenticated ? authSettings : guestSettings).map((setting) => (
                                <MenuItem key={setting} onClick={() => handleMenuClick(setting)}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Header;
