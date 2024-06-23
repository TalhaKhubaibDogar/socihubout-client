"use client";
import React, { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";
import moment from "moment";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import QRCode from "qrcode.react";
import MyEvent from "../myevent/MyEvent";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "100vw", sm: "80vw" },
  maxWidth: { xs: "100%", sm: "600px" },
  maxHeight: { xs: "100vh", sm: "80vh" },
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: { xs: 0, sm: "4px" },
};

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
  const [event, setEvent] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [currentEventId, setCurrentEventId] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [userCoords, setUserCoords] = useState({
    latitude: null,
    longitude: null,
  });
  const [initialModal, setInitialModal] = useState(false);

  const referral =
    typeof window !== "undefined"
      ? localStorage.getItem("referral_code")
      : null;
  useEffect(() => {
    if (locationData) {
      setUserCoords({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
    }
  }, [locationData]);
  const handleChipClick = (category, value) => {
    const pref = `${category}:${value}`;
    setPreferences((prev) =>
      prev.includes(pref)
        ? prev.filter((item) => item !== pref)
        : [...prev, pref]
    );
  };

  const isEventJoinable = (startTime, endTime) => {
    const now = moment();
    const start = moment(startTime);
    const end = moment(endTime);
    return now.isSameOrAfter(start) && now.isBefore(end);
  };

  const handleFeed = () => {
    const token = localStorage.getItem("access_token");
    axios
      .get("https://api.socihubout.site/api/v1/users/feed/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setEvent(response?.data?.data?.Items);
      })
      .catch((error) => {
        if (error.response && error.response.data.code === 401) {
          // If the API returns a 401 error, clear the localStorage and redirect to login page
          localStorage.clear();
          router.push("/login");
        } else {
          alert("Error fetching data:", error);
        }
      });
  };

  const handlePreferencesSubmit = (event) => {
    event.preventDefault();
    const token = localStorage.getItem("access_token");
    const keywords = preferences.map((pref) => pref.split(":")[1]); // Extract only the keyword part

    axios
      .post(
        "https://api.socihubout.site/api/v1/users/preference/",
        { preferences: keywords },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        localStorage.setItem("is_new", "false");
        handleFeed();
      })
      .catch((error) => {
        if (error.response && error.response.data.code === 401) {
          // If the API returns a 401 error, clear the localStorage and redirect to login page
          localStorage.clear();
          router.push("/login");
        } else {
          console.error("Logout failed", error);
          alert(error.response.data.data.message);
        }
      });
  };

  const joinEvent = (eventId) => {
    const token = localStorage.getItem("access_token");
    axios
      .post(
        `https://api.socihubout.site/api/v1/users/events/${eventId}/join`,
        { event: eventId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: { referral_code: referralCode },
        }
      )
      .then((response) => {
        handleCloseModal();
        handleFeed();
      })
      .catch((error) => {
        if (error.response && error.response.data.code === 401) {
          // If the API returns a 401 error, clear the localStorage and redirect to login page
          setShowModal(false);
          localStorage.clear();
          router.push("/login");
        } else {
          console.error("Logout failed", error);
        }
      });
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      setUserRole(role);
      if (!role) {
        // router.push("/login");
      } else {
        if (role === "2") {
          handleFeed();
          if (navigator.geolocation) {
            navigator.permissions
              .query({ name: "geolocation" })
              .then((result) => {
                if (result.state === "granted") {
                  getLocationData();
                }
              });
          } else {
            console.error("Geolocation is not supported by this browser.");
          }

          if (isLoggedIn === "true") {
            setInitialModal(true); // Show initial modal if user has just logged in
            localStorage.setItem("isLoggedIn", "false"); // Reset login flag
          }
        }
      }
    }
  }, [router]);

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
  const formatDate = (dateStr) => {
    return moment(dateStr).format("D MMMM hh:mm A");
  };
  const formatTime = (dateStr) => {
    return moment(dateStr).format("hh:mm A");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEvent([...event]);
    }, 60000);
    return () => clearInterval(interval);
  }, [event]);

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
    setReferralCode(""); // Reset the referral code input
  };

  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of the earth in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180); // deg2rad
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in meters
    return d;
  };

  const canJoinEvent = (event) => {
    const distance = getDistanceFromLatLonInMeters(
      userCoords.latitude,
      userCoords.longitude,
      event.latitude,
      event.longitude
    );
    return distance <= 1000;
  };
  const generateReferralLink = (eventId) => {
    return `http://localhost:3000/join?eventId=${eventId}&referral=${referralCode || referral
      }`;
  };
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Referral link copied to clipboard");
      })
      .catch((error) => {
        alert("Failed to copy referral link");
      });
  };
  return (
    <section className="container">
      {userRole === "2" ? (
        <div style={{ marginTop: "1rem" }}>
          <div className={styles.chipContainer}>
            {Object.entries(categories).map(([category, values]) => (
              <div key={category} className={styles.category}>
                <h3>{category}</h3>
                <div className={styles.chips}>
                  {values.map((value, index) => (
                    <button
                      key={index}
                      className={`${styles.chip} ${preferences.includes(`${category}:${value}`)
                        ? styles.selected
                        : ""
                        }`}
                      onClick={() => handleChipClick(category, value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              className={styles.submitButton}
              onClick={handlePreferencesSubmit}
            >
              Add Preferences
            </button>
          </div>
          <div style={{ margin: "2rem auto", textAlign: "center" }}>
            <h2>Live syncs</h2>
          </div>
          {event.length > 0 ? (
            <div className={styles.event_cards}>
              {event.map((event, index) => (
                <div className={styles.event_card} key={index}>
                  <div className={styles.event_details}>
                    <h2>{event.name}</h2>
                    <p>
                      {formatDate(event.start_datetime)} to{" "}
                      {formatTime(event.end_datetime)}
                    </p>
                  </div>
                  <div className={styles.description}>
                    <p>{event.description}</p>
                  </div>
                  <div className={styles.cardBelow}>
                    <div className={styles.action_buttons}>
                      <p>Share Link</p>
                      <button
                        className={`${styles.copyLinkButton}`}
                        onClick={() =>
                          copyToClipboard(generateReferralLink(event.id))
                        }
                      >
                        Copy Link
                      </button>
                      <QRCode
                        value={generateReferralLink(event.id)}
                        size={50}
                      />
                      {/* <QRCode value={referral || 'default code'} size={50} /> */}
                    </div>
                    <div className={styles.action_buttons}>
                      <p>Terms and Condition</p>
                    </div>
                    <div className={styles.action_buttons}>
                      <button
                        className={`${styles.button} ${styles.joinButton}`}
                        onClick={() => {
                          if (canJoinEvent(event)) {
                            setCurrentEventId(event.id);
                            setShowModal(true);
                          } else {
                            alert(
                              "You are not within 50 meters of the event location."
                            );
                          }
                        }}
                        disabled={
                          !isEventJoinable(
                            event.start_datetime,
                            event.end_datetime
                          ) || event.is_joined
                        }
                      >
                        {event.is_joined === true ? "Joined" : "Join Event"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <h2
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              No Events found.
            </h2>
          )}
        </div>
      ) : (
        <MyEvent />
      )}
      <Modal
        open={showModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">{"Enter Referral Code (Optional)"}</h2>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal} // Use the same function to close the modal
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
            fullWidth
            label="Referral Code"
            variant="outlined"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            className={`${styles.button} ${styles.joinButton}`}
            onClick={() => joinEvent(currentEventId)}
            sx={{ mt: 2 }}
          >
            Join Event
          </Button>
        </Box>
      </Modal>
      <Modal
        open={initialModal}
        onClose={() => setInitialModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">
            {"Please add your preferences to see events tailored for you"}
          </h2>
          <Button
            variant="contained"
            className={`${styles.button} ${styles.joinButton}`}
            onClick={() => setInitialModal(false)}
            sx={{ mt: 2 }}
          >
            Okey
          </Button>
        </Box>
      </Modal>
    </section>
  );
}
