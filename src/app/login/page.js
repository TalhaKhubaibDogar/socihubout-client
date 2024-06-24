'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Image from 'next/image'
import loginImage from '../../assets/signup.webp'
import logo from '../../assets/Socihubout.webp'
import styles from './login.module.css' // Import CSS module
const validationSchema = Yup.object({
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().min(8).required('Password is required'),
  reenterPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .min(8)
    .required('Re-enter Password is required'),
  userType: Yup.string().required('User Type is required'),
});

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullname, setFullname] = useState('')
  const [formType, setFormType] = useState('login')
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('access_token')
    if (userData) {
      router.push('/dashboard')
    }
  }, [router])

  const handleLogin = (event) => {
    event.preventDefault()
    axios
      .post('https://api.socihubout.site/api/v1/users/login/', {
        email: email,
        password: password,
      })
      .then((res) => {
        console.log(res.data)
        const data = res.data.response
        localStorage.setItem('id', data.id)
        localStorage.setItem('first_name', data.first_name)
        localStorage.setItem('last_name', data.last_name)
        localStorage.setItem('email', data.email)
        localStorage.setItem('full_name', data.full_name)
        localStorage.setItem('role', data.role)
        localStorage.setItem('referral_code', data.referral_code)
        localStorage.setItem('is_new', data.is_new)
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('expire_on', data.expire_on)
        localStorage.setItem('profile_image', data.profile_image)
        localStorage.setItem('isLoggedIn', true)

        router.push('/dashboard')
      })
      .catch((error) => {
        console.log(error)
        alert(error?.response?.data?.meta?.message)
      })
  }

  return (
    <div className={styles.containerExtra}>
      <div className={styles.frame}>
        <div className={styles.nav}>
          <ul className={styles.links}>
            <li className={styles.signinActive}>
              <a className={styles.btn}>Sign in</a>
            </li>
          </ul>
        </div>
        <form onSubmit={handleLogin} className={styles.formSignin}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <div className={styles.checkboxContainer}>
            <input type="checkbox" id="checkbox" />
            <label htmlFor="checkbox" className={styles.label}>
              <span className="ui"></span>Keep me signed in
            </label>
          </div>
          <button type="submit" className={styles.button}>Sign In</button>
        </form>
        <div className={styles.forgot}>
          <Link href='/signup' legacyBehavior>
            <a>{"Don't have an account? Sign Up"}</a>
          </Link>
          <Link href='/forgotPassword' legacyBehavior>
            <a>Forgot password?</a>
          </Link>
        </div>
      </div>
    </div>
  )
}
