'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('access_token');
    if (userData) {
      router.push('/dashboard');
    }
  }, [router])
  return (
    <section className={Styles.main}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: "1rem",
        }}
      >
        <Link href="/signup" legacyBehavior>
          <a className={Styles.btn}>Sign Up</a>
        </Link>
        <Link href="/login" legacyBehavior>
          <a className={Styles.btn}>Login</a>
        </Link>
      </div>
    </section>
  );
}
