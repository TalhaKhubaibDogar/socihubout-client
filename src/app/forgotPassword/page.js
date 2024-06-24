'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import styles from '../login/login.module.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  // const handleLogin = (event) => {
  //     event.preventDefault();
  //     router.push('/dashboard');
  // };
  const handleForgotPassword = (event) => {
    event.preventDefault()
    axios
      .post('https://api.socihubout.site/api/v1/users/password-reset/', {
        email: email,
      })
      .then((response) => {
        // Handle successful OTP verification
        console.log(response.data)
        alert(response?.data?.meta?.message)
        router.push('/login')
      })
      .catch((error) => {
        console.error('OTP verification error:', error)
        // Handle OTP verification error
        alert('Reset Password Failed. Please try again.')
      })
  }

  return (
    <div className={`${styles.containerExtra} container`}>
      <div className={styles.frame}>
        <div className={styles.nav}>
          <ul className={styles.links}>
            <li className={styles.signinActive}>
              <a className={styles.btn}>Forgot Password</a>
            </li>
          </ul>
        </div>
        <form onSubmit={handleForgotPassword} className={styles.formSignin}>
          <label htmlFor="email" className={styles.label}>Your Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>Send Email</button>
        </form>
      </div>
    </div>
  )
}
