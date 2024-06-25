'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { Button, TextField, Modal, Box, IconButton, Typography, FormControl, InputLabel, Select, MenuItem, Stack, Chip } from '@mui/material';
import axios from 'axios';
import styles from './myevent.module.css'
import Link from 'next/link';
import CloseIcon from '@mui/icons-material/Close';
import moment from 'moment';

const categories = {
    Mood: ['chill', 'energetic', 'relaxed', 'vibrant', 'cozy', 'bohemian', 'sophisticated', 'fun', 'playful', 'mellow'],
    Ambience: ['intimate', 'inviting', 'electric', 'romantic', 'festive', 'laid-back', 'warm', 'modern', 'rustic', 'glamorous'],
    PartyThemes: ['tropical luau', '1920s gatsby', 'disco fever', 'hollywood red carpet', 'masquerade ball', 'carnival/circus', 'beach bash', 'winter wonderland', 'casino night', 'around the world'],
};
const inputFieldStyles = {
    mt: 2,
    color: '#fff',
    borderRadius: '30px',
    background: "linear-gradient(rgba(35, 43, 85, 1), rgba(35, 43, 85, 1))",
    '& .MuiInputBase-root': {
        color: '#fff', // Changes the text color
    },
    '& label.Mui-focused': {
        color: '#fff', // Changes the label color when focused
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'transparent',
            borderRadius: '12px',
        },
        '&:hover fieldset': {
            borderColor: 'transparent', // Removes border on hover
        },
        '&.Mui-focused fieldset': {
            borderColor: 'transparent', // Removes border when focused
        },
    },
    '& .MuiInputLabel-root': {
        color: '#fff' // Ensures labels are white
    }
};
const chipStyles = {
    ...inputFieldStyles,
    '& .MuiChip-deleteIcon': {
        color: 'rgb(255 255 255) !important', // Add !important to ensure it overrides any other styles
    },
};

export default function Dashboard() {
    const router = useRouter();
    const [locationData, setLocationData] = useState(null);
    const [open, setOpen] = useState(false);
    const [focus, setFocus] = useState(false);
    const [isFocus, setIsFocus] = useState(false);
    const [event, setEvent] = useState('');
    const [eventData, setEventData] = useState({
        name: '',
        address: '',
        location_url: '',
        latitude: '',
        longitude: '',
        start_datetime: '',
        end_datetime: '',
        description: '',
        keywords: [],
    });
    const [locationPromptOpen, setLocationPromptOpen] = useState(false);
    const handleFocus = () => {
        setIsFocus(true)
    }
    const handleBlur = () => {
        setIsFocus(false)
    }
    const handleFocus2 = () => {
        setFocus(true)
    }
    const handleBlur2 = () => {
        setFocus(false)
    }
    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('https://api.socihubout.site/api/v1/user/events/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            // Update state with the retrieved data
            setEvent(response?.data?.response);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem('role');
        if (!userData) {
            router.push('/login'); // Redirect to login if no userData is found
        } else {
            // Proceed with geolocation check if userData exists
            if (navigator.geolocation) {
                navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                    if (result.state === 'granted') {
                        getLocationData();
                    } else if (result.state === 'prompt' || result.state === 'denied') {
                        setLocationPromptOpen(true);
                    }
                });
            } else {
                console.error('Geolocation is not supported by this browser.');
            }
        }
    }, [router]);

    useEffect(() => {
        if (locationData) {
            setEventData((prevEventData) => ({
                ...prevEventData,
                address: locationData.displayName,
                location_url: `https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
            }));
        }
    }, [locationData]);

    const getLocationData = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;

                fetch(nominatimUrl)
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.address) {
                            const { village, town, city, state, country } = data.address;
                            const displayName = data.display_name;
                            const location = village || town || city || "";
                            setLocationData({
                                latitude,
                                longitude,
                                location,
                                state: state || "",
                                country: country || "",
                                displayName: displayName || "",
                            });
                            setEventData(prevEventData => ({
                                ...prevEventData,
                                latitude: latitude.toString(), // Ensure the latitude is updated
                                longitude: longitude.toString(), // Ensure the longitude is updated
                                address: displayName || prevEventData.address
                            }));
                        } else {
                            console.error("No location details found.");
                        }
                    })
                    .catch((error) => {
                        console.error("Error getting location details:", error);
                    });
            },
            (error) => {
                console.error("Error getting location:", error);
            }
        );
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setEventData((prevEventData) => ({
            ...prevEventData,
            name: '',
            keywords: [],
        }));
    };

    const handleLocationPromptClose = () => {
        setLocationPromptOpen(false);
        getLocationData();
    };

    const handleSelectChange = (category, value) => {
        setEventData((prevEventData) => ({
            ...prevEventData,
            keywords: prevEventData.keywords.includes(value) ? prevEventData.keywords : [...prevEventData.keywords, value],
        }));
    };

    const handleDeleteKeyword = (keywordToDelete) => {
        setEventData((prevEventData) => ({
            ...prevEventData,
            keywords: prevEventData.keywords.filter((keyword) => keyword !== keywordToDelete),
        }));
    };

    const handleSubmit = () => {
        const token = localStorage.getItem('access_token');
        const formattedEventData = {
            ...eventData,
            start_datetime: moment(eventData.start_datetime).format('YYYY-MM-DDTHH:mm:ssZ'),
            end_datetime: moment(eventData.end_datetime).format('YYYY-MM-DDTHH:mm:ssZ'),
            latitude: eventData.latitude, // Send the latitude
            longitude: eventData.longitude, // Send the longitude
        };
        axios.post('https://api.socihubout.site/api/v1/user/events/', formattedEventData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                alert(response.data?.meta?.message);
                handleClose();
                fetchEvents();
            })
            .catch(error => {
                if (error?.response?.data?.meta?.code === 401) {
                    localStorage.clear();
                    router.push("/login");
                } else {
                    alert(error?.response?.data?.meta?.message);
                }
            });
    };
    // Getting the current datetime in the required format for input[type='datetime-local']
    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
        return localDate.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm format
    };

    // State to store the minimum datetime
    const [minDateTime, setMinDateTime] = useState(getCurrentDateTimeLocal());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMinDateTime(getCurrentDateTimeLocal());
        }, 60000); // Update the minimum date every minute

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    return (
        <div className='container'>
            <div className={styles.main}>
                <h1>My Events</h1>
                <Button
                    className={styles.headingButton}
                    onClick={handleOpen}
                >
                    Create Event
                </Button>
            </div>
            <div className={styles.event_container}>
                {event.length > 0 ? (
                    <div className={styles.event_cards}>
                        {event.map((event, index) => (
                            <Link href={`/myevent/${event.id}`} key={index} passHref>
                                <div className={styles.event_card}>
                                    <h2>Name: {event.name}</h2>
                                    <p>Address: {event.address}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p>No Events found.</p>
                )}
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#fff",
                        width: {
                            xs: "100vw",
                            sm: "80vw",
                        },
                        maxWidth: {
                            xs: "100%",
                            sm: "600px",
                        },
                        maxHeight: {
                            xs: "100vh", // Full height on extra-small screens (typically mobile devices)
                            sm: "80vh", // Smaller height on small screens and above
                        },
                        overflowY: "auto",
                        background: "linear-gradient(rgba(41, 73, 88, 1), rgba(61, 125, 146, 1))",
                        boxShadow: 24,
                        p: 4,
                        m: 0,
                        mb: 1,
                        borderRadius: {
                            xs: 0, // No border radius on extra-small screens
                            sm: "4px", // Rounded corners on small screens and above
                        },
                    }}
                >
                    <Typography
                        component="h2"
                        style={{ fontWeight: "bold", textAlign: "center" }}
                    >
                        Create Event
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <TextField
                        label="Event Name"
                        name="name"
                        fullWidth
                        value={eventData.name}
                        onChange={(e) =>
                            setEventData({ ...eventData, name: e.target.value })
                        }
                        sx={inputFieldStyles}
                    />
                    <TextField
                        label="Address"
                        name="address"
                        fullWidth
                        value={eventData.address}
                        onChange={(e) =>
                            setEventData({ ...eventData, address: e.target.value })
                        }
                        sx={inputFieldStyles}
                    />
                    <TextField
                        label="Latitude"
                        name="latitude"
                        type="number"
                        fullWidth
                        value={eventData.latitude}
                        onChange={(e) => setEventData({ ...eventData, latitude: e.target.value })}
                        sx={inputFieldStyles}
                    />

                    <TextField
                        label="Longitude"
                        name="longitude"
                        type="number"
                        fullWidth
                        value={eventData.longitude}
                        onChange={(e) => setEventData({ ...eventData, longitude: e.target.value })}
                        sx={inputFieldStyles}
                    />
                    <TextField
                        label="Start Date and Time"
                        type={focus ? "datetime-local" : "text"}
                        onFocus={handleFocus2}
                        onBlur={handleBlur2}
                        fullWidth
                        value={eventData.start_datetime}
                        onChange={(e) =>
                            setEventData({ ...eventData, start_datetime: e.target.value })
                        }
                        inputProps={{
                            min: minDateTime,
                        }}
                        sx={inputFieldStyles}
                    />
                    <TextField
                        label="End Date and Time"
                        type={isFocus ? "datetime-local" : "text"}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        fullWidth
                        value={eventData.end_datetime}
                        onChange={(e) =>
                            setEventData({ ...eventData, end_datetime: e.target.value })
                        }
                        inputProps={{
                            min: eventData.start_datetime || minDateTime, // Ensure end time is not before start time
                        }}
                        sx={inputFieldStyles}
                    />
                    <TextField
                        label="Description"
                        name="description"
                        fullWidth
                        multiline
                        rows={4}
                        value={eventData.description}
                        onChange={(e) =>
                            setEventData({ ...eventData, description: e.target.value })
                        }
                        sx={inputFieldStyles}
                    />
                    <Typography
                        component="h2"
                        style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            marginTop: "1rem",
                        }}
                    >
                        Add keywords For Preference
                    </Typography>
                    {Object.entries(categories).map(([category, values]) => (
                        <FormControl fullWidth sx={inputFieldStyles} key={category}>
                            <InputLabel>{category}</InputLabel>
                            <Select
                                label={category}
                                onChange={(e) => handleSelectChange(category, e.target.value)}
                                value=""
                            >
                                {values.map((value) => (
                                    <MenuItem key={value} value={value}>
                                        {value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ))}
                    <Stack direction="row" spacing={1}
                        sx={{
                            mt: 2,
                            flexWrap: "wrap",
                            color: '#fff',
                        }}>
                        {eventData.keywords.map((keyword, index) => (
                            <Chip
                                key={index}
                                label={keyword}
                                onDelete={() => handleDeleteKeyword(keyword)}
                                sx={chipStyles}
                            />
                        ))}
                    </Stack>
                    <Button
                        onClick={handleSubmit}
                        className={styles.modalButton}
                        sx={{ mt: 2, }}
                    >
                        Submit
                    </Button>
                </Box>
            </Modal>

            <Modal
                open={locationPromptOpen}
                onClose={handleLocationPromptClose}
                aria-labelledby="location-prompt-title"
                aria-describedby="location-prompt-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#fff",
                        width: {
                            xs: "90vw",
                            sm: "400px",
                        },
                        background: "linear-gradient(rgba(41, 73, 88, 1), rgba(61, 125, 146, 1))",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: "12px",
                    }}
                >
                    <Typography id="location-prompt-title" variant="h6" component="h2" gutterBottom>
                        Enable Location Services
                    </Typography>
                    <Typography id="location-prompt-description" sx={{ mb: 2 }}>
                        To create an event, we need access to your location. Please enable location services in your browser settings.
                    </Typography>
                    <Button
                        onClick={handleLocationPromptClose}
                        variant="contained"
                        sx={{ mt: 2, background: "#1976d2", color: "#fff" }}
                    >
                        Enable Location
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}
