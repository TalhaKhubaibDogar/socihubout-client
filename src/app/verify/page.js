'use client';
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import styles from '../login/login.module.css'

export default function Verify() {
  const [otp, setOtp] = useState(new Array(6).fill(''))
  const [email, setEmail] = useState('')
  const router = useRouter()
  const inputRefs = useRef([])

  useEffect(() => {
    const storedEmail = localStorage.getItem('email')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      router.push('/signup')
    }
  }, [router])

  const handleChange = (element, index) => {
    if (/[^0-9]/.test(element.value)) return
    const newOtp = [...otp]
    newOtp[index] = element.value
    setOtp(newOtp)

    // Move to next input
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus()
    }

    // Move to previous input if input is empty
    if (!element.value && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleVerify = (event) => {
    event.preventDefault()
    const otpValue = otp.join('')
    axios
      .post('https://api.socihubout.site/api/v1/users/verify-otp/', {
        email: email,
        otp: otpValue,
      })
      .then((response) => {
        console.log(response.data)
        router.push('/login')
      })
      .catch((error) => {
        console.error('OTP verification error:', error)
        alert('OTP verification failed. Please try again.')
      })
  }

  return (
    <div className={styles.containerExtra}>
      <div className={styles.frame}>
        <div className={styles.nav}>
          <ul className={styles.links}>
            <li className={styles.signinActive}>
              <a className={styles.btn}>Verify OTP</a>
            </li>
          </ul>
        </div>
        <form onSubmit={handleVerify} className={styles.formSignin}>
          <div className={styles.otpContainer}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                name="otp"
                maxLength="1"
                className={styles.otpInput}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                ref={(el) => inputRefs.current[index] = el}
                required
              />
            ))}
          </div>
          <button type="submit" className={styles.button}>Verify OTP</button>
        </form>
      </div>
    </div>
  )
}
