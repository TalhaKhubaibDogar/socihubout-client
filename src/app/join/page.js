"use client";
import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

function PaymentSuccessComponent() {
  const router = useRouter();
  const params = useSearchParams();
  let eventId = params.get("eventId");
  let referral = params.get("referral");
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    if (!role) {
      router.push("/login");
    } else {
      axios
        .post(
          `https://api.socihubout.site/api/v1/user/events/${eventId}/join`,
          { event: eventId },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            params: { referral_code: referral },
          }
        )
        .then((response) => {
          router.push("/dashboard");
        })
        .catch((error) => {
          if (error.response && error?.response?.data?.meta?.code === 400) {
            localStorage.clear();
            router.push("/dashboard");
          } else if (error.response && error?.response?.data?.meta?.code === 401) {
            // If the API returns a 401 error, clear the localStorage and redirect to login page
            localStorage.clear();
            router.push("/login");
          } else {
            alert("Error fetching data:", error);
          }
        });
    }
  }, [router]);

  return <div className="container">Loading....</div>;
}
export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessComponent />
    </Suspense>
  );
}
