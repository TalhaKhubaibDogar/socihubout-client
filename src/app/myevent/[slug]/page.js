"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import styles from "./id.module.css";
import moment from "moment";

export default function EventPage() {
  const [data, setData] = useState(null);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    axios
      .get(`https://api.socihubout.site/api/v1/users/events/${params.slug}/`, {
        // Use the slug as the event ID
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setData(response.data.data);
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
  }, []);
  const HandleDelete = () => {
    const token = localStorage.getItem("access_token");
    axios
      .delete(`https://api.socihubout.site/api/v1/users/events/${params.slug}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        alert(response.data.message_code);
        router.push("/myevent");
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
  const formatDate = (dateStr) => {
    return moment(dateStr).format("D MMMM hh:mm A");
  };
  return (
    <div className="container">
      <h2 style={{ textAlign: "center", marginTop: "1.5rem" }}>
        Event Details
      </h2>
      {data ? (
        <div className={styles.event_container}>
          <p style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>Name: </span> {data.name}
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>Address: </span>
            {data.description}
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>Start Time: </span>{" "}
            {formatDate(data.start_datetime)}
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>End Time: </span>{" "}
            {formatDate(data.end_datetime)}
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>Address: </span> {data.address}
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>Host: </span> {data.host}
          </p>
          <div className={styles.centerButton}>
            <button className={styles.deleteButton} onClick={HandleDelete}>
              Delete This Event
            </button>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
