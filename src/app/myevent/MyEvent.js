"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  TextField,
  Modal,
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
} from "@mui/material";
import axios from "axios";
import styles from "./myevent.module.css";
import Link from "next/link";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";

const categories = {
  Mood: [
    "chill",
    "energetic",
    "relaxed",
    "vibrant",
    "cozy",
    "bohemian",
    "sophisticated",
    "fun",
    "playful",
    "mellow",
  ],
  Ambience: [
    "intimate",
    "inviting",
    "electric",
    "romantic",
    "festive",
    "laid-back",
    "warm",
    "modern",
    "rustic",
    "glamorous",
  ],
  PartyThemes: [
    "tropical luau",
    "1920s gatsby",
    "disco fever",
    "hollywood red carpet",
    "masquerade ball",
    "carnival/circus",
    "beach bash",
    "winter wonderland",
    "casino night",
    "around the world",
  ],
};
export default function Dashboard() {
  const router = useRouter();
  const [locationData, setLocationData] = useState(null);
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState("");
  const [eventData, setEventData] = useState({
    name: "",
    address: "",
    location_url: "",
    latitude: "",
    longitude: "",
    start_datetime: "",
    end_datetime: "",
    description: "",
    keywords: [],
  });

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "https://api.socihubout.site/api/v1/user/events/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update state with the retrieved data
      setEvent(response?.data?.response);
    } catch (error) {
      if (error.response && error?.response?.data?.meta?.code === 401) {
        // If the API returns a 401 error, clear the localStorage and redirect to login page
        localStorage.clear();
        router.push("/login");
      } else {
        alert("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "1") {
      fetchEvents();
    }
  }, []);
  useEffect(() => {
    const userData = localStorage.getItem("role");
    if (!userData) {
      router.push("/login"); // Redirect to login if no userData is found
    } else {
      // Proceed with geolocation check if userData exists
      if (navigator.geolocation) {
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
          if (result.state === "granted") {
            getLocationData();
          }
        });
      } else {
        console.error("Geolocation is not supported by this browser.");
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
      name: "",
      keywords: [],
    }));
  };

  const handleSelectChange = (category, value) => {
    setEventData((prevEventData) => ({
      ...prevEventData,
      keywords: prevEventData.keywords.includes(value)
        ? prevEventData.keywords
        : [...prevEventData.keywords, value],
    }));
  };

  const handleDeleteKeyword = (keywordToDelete) => {
    setEventData((prevEventData) => ({
      ...prevEventData,
      keywords: prevEventData.keywords.filter(
        (keyword) => keyword !== keywordToDelete
      ),
    }));
  };
  const handleSubmit = () => {
    const token = localStorage.getItem("access_token");
    const formattedEventData = {
      ...eventData,
      start_datetime: moment(eventData.start_datetime).format(
        "YYYY-MM-DDTHH:mm:ssZ"
      ),
      end_datetime: moment(eventData.end_datetime).format(
        "YYYY-MM-DDTHH:mm:ssZ"
      ),
    };
    axios
      .post(
        "https://api.socihubout.site/api/v1/user/events/",
        formattedEventData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        alert(response?.data?.meta?.message);
        handleClose();
        fetchEvents();
      })
      .catch((error) => {
        console.log(error)
        alert(error?.meta?.message);
      });
  };
  // Getting the current datetime in the required format for input[type='datetime-local']
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
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
    <div className="container">
      <div className={styles.main}>
        <h1>My Events</h1>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#272727", color: "#fff" }}
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
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            m: 0,
            mb:1,
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
          />
          <TextField
            label="Address"
            name="address"
            fullWidth
            value={eventData.address}
            onChange={(e) =>
              setEventData({ ...eventData, address: e.target.value })
            }
            sx={{ mt: 2 }}
          />
          <TextField
            label="Start Date and Time"
            type="datetime-local"
            fullWidth
            value={eventData.start_datetime}
            onChange={(e) =>
              setEventData({ ...eventData, start_datetime: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: minDateTime,
            }}
            sx={{ mt: 2 }}
          />
          <TextField
            label="End Date and Time"
            type="datetime-local"
            fullWidth
            value={eventData.end_datetime}
            onChange={(e) =>
              setEventData({ ...eventData, end_datetime: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: eventData.start_datetime || minDateTime, // Ensure end time is not before start time
            }}
            sx={{ mt: 2 }}
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
            sx={{ mt: 2 }}
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
            <FormControl fullWidth sx={{ mt: 2 }} key={category}>
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
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
            {eventData.keywords.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                onDelete={() => handleDeleteKeyword(keyword)}
              />
            ))}
          </Stack>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ mt: 2, backgroundColor: "#272727", color: "#fff" }}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </div>
  );
}
