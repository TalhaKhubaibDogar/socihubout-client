"use client";
import React, { useState, useEffect } from "react";
import styles from "./profile.module.css";
import axios from "axios";
import { Button, TextField, Modal, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function Profile() {
    
    const [data, setData] = useState("");
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const [eventData, setEventData] = useState({
        first_name: '',
        last_name: '',
    });
    const [image, setImage] = useState(null);
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
    const handleClose = () => {
        setOpen(false);
        setEventData((prevEventData) => ({
            first_name:'',
            last_name:''
        }));
        setImage(null)
    };
    const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
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
        <section className={`${styles.extraContainer} container`}>
            <div className={styles.transaction}>
                <div className={styles.headingButton}>
                    <h2>Profile</h2>
                    <button onClick={handleOpen}>
                        Edit Profile
                    </button>
                </div>
                {data ? (
                    <table>
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{data.first_name}</td>
                                <td>{data.last_name}</td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <p> Nothing to show</p>
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
                    width: {
                        xs: '100vw',
                        sm: '80vw',
                    },
                    maxWidth: {
                        xs: '100%',
                        sm: '600px',
                    },
                    maxHeight: {
                        xs: '100vh', // Full height on extra-small screens (typically mobile devices)
                        sm: '80vh', // Smaller height on small screens and above
                    },
                    overflowY: 'auto',
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                    m: 0,
                    borderRadius: {
                        xs: 0, // No border radius on extra-small screens
                        sm: '4px', // Rounded corners on small screens and above
                    },
                }}>
                    <Typography component="h2" style={{ fontWeight: 'bold', textAlign: 'center' }}>
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
                    <TextField
                        label="First Name"
                        name="firstName"
                        fullWidth
                        value={eventData.first_name}
                        onChange={(e) => setEventData({ ...eventData, first_name: e.target.value })}
                    />
                    <TextField
                        label="Last Name"
                        name="lastName"
                        fullWidth
                        value={eventData.last_name}
                        onChange={(e) => setEventData({ ...eventData, last_name: e.target.value })}
                        sx={{ mt: 2 }}
                    />
                    <input
                        accept=".png, .jpg, .jpeg, .webp"
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        style={{ marginTop: 16 }}
                    />
                    <Button onClick={handleEditProfile} variant="contained" sx={{ mt: 2, backgroundColor: '#272727', color: '#fff' }}>
                        Submit
                    </Button>
                </Box>
            </Modal>
        </section>
    );
}
