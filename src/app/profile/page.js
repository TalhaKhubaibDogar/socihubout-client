"use client";
import React, { useState, useEffect } from "react";
import styles from "./profile.module.css";
import axios from "axios";
import { Button, TextField, Modal, Box, IconButton, Typography, Avatar, Card, CardContent, CardMedia } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

export default function Profile() {
    const [data, setData] = useState({});
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setEventData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
        });
        setImage(data.profile_image || '');
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const [eventData, setEventData] = useState({
        first_name: '',
        last_name: '',
    });
    const [image, setImage] = useState('');

    useEffect(() => {
        const first_name = localStorage.getItem('first_name');
        const last_name = localStorage.getItem('last_name');
        const profile_image = localStorage.getItem('profile_image');

        setData({
            first_name: first_name || '',
            last_name: last_name || '',
            profile_image: profile_image || ''
        });
    }, []);

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    const handleEditProfile = () => {
        const formData = new FormData();
        formData.append('first_name', eventData.first_name);
        formData.append('last_name', eventData.last_name);
        if (image) {
            formData.append('profile_image', image);
        }
        axios
            .post("https://api.socihubout.site/api/v1/users/profile/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                const profileData = response?.data?.response;
                setData(profileData);
                localStorage.setItem('profile_image', profileData.profile_image);
                localStorage.setItem('first_name', profileData.first_name);
                localStorage.setItem('last_name', profileData.last_name);
                handleClose();
            })
            .catch((error) => {
                if (error?.response?.data?.meta?.code === 401) {
                    localStorage.clear();
                    router.push("/login");
                } else {
                    alert(error?.response?.data?.meta?.message);
                }
            });
    };

    return (
        <section className='container'>
            <div className={styles.transaction}>
                <div className={styles.headingButton}>
                    <h2>Profile</h2>
                    <button onClick={handleOpen}>
                        Edit Profile
                    </button>
                </div>
                {data.first_name || data.last_name ? (
                    <div className={styles.profileData}>
                        <Avatar
                            alt="Profile Image"
                            src={data.profile_image}
                            sx={{ width: 100, height: 100, }}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                <span>First Name: </span>{data.first_name}
                            </Typography>
                            <Typography gutterBottom variant="h5" component="div">
                                <span>Last Name: </span>{data.last_name}
                            </Typography>
                        </CardContent>
                    </div>
                ) : (
                    <p>Nothing to show</p>
                )}
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90vw',
                    maxWidth: '400px',
                    bgcolor: 'background.paper',
                    border: 'none',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <Typography component="h2" style={{ fontWeight: 'bold', marginBottom: '16px' }}>
                        Edit Profile
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Avatar
                        alt="Profile Image"
                        src={image}
                        sx={{ width: 100, height: 100, margin: '0 auto' }}
                    />
                    <IconButton color="primary" aria-label="upload picture" component="label">
                        <input hidden accept="image/*" type="file" onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))} />
                        <PhotoCameraIcon />
                    </IconButton>
                    <TextField
                        label="First Name"
                        name="firstName"
                        fullWidth
                        value={eventData.first_name}
                        onChange={(e) => setEventData({ ...eventData, first_name: e.target.value })}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        label="Last Name"
                        name="lastName"
                        fullWidth
                        value={eventData.last_name}
                        onChange={(e) => setEventData({ ...eventData, last_name: e.target.value })}
                        sx={{ mt: 2 }}
                    />
                    <Button onClick={handleEditProfile} variant="contained" sx={{ mt: 2, backgroundColor: '#3d7d92', color: '#fff' }}>
                        Submit
                    </Button>
                </Box>
            </Modal>
        </section>
    );
}
