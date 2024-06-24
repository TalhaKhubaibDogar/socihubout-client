'use client'
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import styles from '../login/login.module.css'
import CandyModal from '@/components/CandyModal';

const validationSchema = Yup.object({
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters long').required('Password is required'),
  reenterPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Re-enter Password is required'),
  userType: Yup.string().required('User Type is required'),
});

export default function SignUp() {
  const router = useRouter();
  const [totalCandy, setTotalCandy] = useState(0);
  const [candyOpen, setCandyOpen] = useState(false);

  useEffect(() => {
    try {
      axios.get('/api/CandyPayments').then((res) => {
        setTotalCandy(res?.data?.totalDonations / 100);
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleSubmit = (values, { setSubmitting }) => {
    if (values.userType === '2') {
      handleSubmitAPI(values, { setSubmitting });
    } else {
      localStorage.setItem('signupData', JSON.stringify(values));
      setCandyOpen(true);
      setSubmitting(false);
    }
  };

  const handleSubmitAPI = async (values, { setSubmitting }) => {
    const signupData = {
      email: values.email,
      first_name: values.firstName,
      last_name: values.lastName,
      password: values.password,
      password2: values.reenterPassword,
      role: values.userType,
    };
    console.log(signupData)

    try {
      const response = await axios.post('https://api.socihubout.site/api/v1/users/signup/', signupData);
      // Handle successful signup, e.g., navigate to the verification page or login page
      console.log(response.data);
      localStorage.setItem('email', values.email);
      router.push('/verify');
    } catch (error) {
      console.error('Signup error:', error);
      // Handle signup error, e.g., show an error message
      alert(error?.response?.data?.meta?.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.containerExtra}>
      <div className={styles.frame}>
        <div className={styles.nav}>
          <ul className={styles.links}>
            <li className={styles.signupActive}>
              <a className={styles.btn}>Sign up</a>
            </li>
          </ul>
        </div>
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            reenterPassword: '',
            userType: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className={styles.formSignup}>
              <label htmlFor="firstName" className={styles.label}>First Name</label>
              <Field
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                className={styles.input}
                required
              />
              <ErrorMessage name="firstName" component="div" className={styles.error} />

              <label htmlFor="lastName" className={styles.label}>Last Name</label>
              <Field
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                className={styles.input}
                required
              />
              <ErrorMessage name="lastName" component="div" className={styles.error} />

              <label htmlFor="email" className={styles.label}>Email</label>
              <Field
                type="email"
                name="email"
                placeholder="Enter your email"
                className={styles.input}
                required
              />
              <ErrorMessage name="email" component="div" className={styles.error} />

              <label htmlFor="password" className={styles.label}>Password</label>
              <Field
                type="password"
                name="password"
                placeholder="Enter your password"
                className={styles.input}
                required
              />
              <ErrorMessage name="password" component="div" className={styles.error} />

              <label htmlFor="reenterPassword" className={styles.label}>Re-enter Password</label>
              <Field
                type="password"
                name="reenterPassword"
                placeholder="Re-enter your password"
                className={styles.input}
                required
              />
              <ErrorMessage name="reenterPassword" component="div" className={styles.error} />

              <label htmlFor="userType" className={styles.label}>User Type</label>
              <Field as="select" name="userType" className={styles.select}>
                <option value="" label="Select user type" />
                <option value="1" label="Host" />
                <option value="2" label="User" />
              </Field>
              <ErrorMessage name="userType" component="div" className={styles.error} />

              <button type="submit" className={styles.button} disabled={isSubmitting}>Sign Up</button>
            </Form>
          )}
        </Formik>
        <div className={styles.forgot}>
          <Link href='/login' legacyBehavior>
            <a>{'Already have an account? Sign in'}</a>
          </Link>
        </div>
      </div>
      <CandyModal open={candyOpen} setOpen={setCandyOpen} />
    </div>
  );
}
