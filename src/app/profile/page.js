"use client";
import React, { useState, useEffect } from "react";
import styles from "./profile.module.css";
import axios from "axios";
import { Button, TextField, Modal, Box, IconButton, Typography, Avatar, CardContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

export default function Profile() {
    const [data, setData] = useState({});
    const [open, setOpen] = useState(false);
    const [eventData, setEventData] = useState({
        first_name: '',
        last_name: '',
    });
    const [image, setImage] = useState('');
    const [imageFile, setImageFile] = useState(null);

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

    useEffect(() => {
        setEventData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
        });
        setImage(data.profile_image || '');
    }, [data]);

    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    const handleEditProfile = () => {
        const formData = new FormData();
        formData.append('first_name', eventData.first_name);
        formData.append('last_name', eventData.last_name);
        if (imageFile) {
            formData.append('profile_image', imageFile);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(URL.createObjectURL(file));
            setImageFile(file); // Store the actual file object separately
        }
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
                            sx={{ width: 100, height: 100, margin: '0 auto' }}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                <span>
                                    <p>First Name: </p>
                                    <p className={styles.data}>
                                        {data.first_name}
                                    </p>
                                </span>
                            </Typography>
                            <Typography gutterBottom variant="h5" component="div">
                                <span>
                                    <p>Last Name: </p>
                                    <p className={styles.data}>
                                        {data.last_name}
                                    </p>
                                </span>
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
                        <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                        <PhotoCameraIcon />
                    </IconButton>
                    <TextField
                        label="First Name"
                        name="first_name"
                        fullWidth
                        value={eventData.first_name}
                        onChange={handleChange}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        label="Last Name"
                        name="last_name"
                        fullWidth
                        value={eventData.last_name}
                        onChange={handleChange}
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
