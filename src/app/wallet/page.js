"use client";
import React, { useState, useEffect, cloneElement } from "react";
import styles from "./preference.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";
import moment from "moment";

export default function Wallet() {
  const [walletData, setWalletData] = useState("");
  const [data, setData] = useState("");
  console.log(data);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const handleWallet = () => {
    axios
      .get("https://api.socihubout.site/api/v1/users/wallet/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setWalletData(response.data.data.Items);
      })
      .catch((error) => {
        if (error.response && error.response.data.code === 401) {
          // If the API returns a 401 error, clear the localStorage and redirect to login page
          localStorage.clear();
          router.push("/login");
        } else {
          alert("Error submitting preferences:", error);
        }
      });
  };
  const handleTransaction = () => {
    axios
      .get("https://api.socihubout.site/api/v1/users/transactions/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setData(response.data.data.Items);
      })
      .catch((error) => {
        if (error.response && error.response.data.code === 401) {
          // If the API returns a 401 error, clear the localStorage and redirect to login page
          localStorage.clear();
          router.push("/login");
        } else {
          alert("Error submitting preferences:", error);
        }
      });
  };

  useEffect(() => {
    handleWallet();
    handleTransaction();
  }, []);
  return (
    <section className={`${styles.mainWallet} container`}>
      <div className={styles.wallet}>
        <h2>Your Wallet Details</h2>
        <p>{walletData.balance} $</p>
      </div>
      <div className={styles.transaction}>
        <h2>Your Referral Bonus List</h2>
        {data.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>User Email</th>
                <th>Full Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.user_details.email}</td>
                  <td>{`${item.user_details.first_name} ${item.user_details.last_name}`}</td>
                  <td>{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p> No Referral Bonus List at this time</p>
        )}
      </div>
    </section>
  );
}
