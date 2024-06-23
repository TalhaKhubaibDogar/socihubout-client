'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function PaymentSuccess() {
  const router = useRouter()

  useEffect(() => {
    const Data = JSON.parse(localStorage.getItem('signupData'))
    const signupData = {
      email: Data.email,
      first_name: Data.firstName,
      last_name: Data.lastName,
      password: Data.password,
      password2: Data.reenterPassword,
      role: Data.userType,
    }

    if (signupData) {
      axios
        .post('https://api.socihubout.site/api/v1/users/signup/', signupData)
        .then((response) => {
          // Handle successful signup, e.g., navigate to the verification page or login page
          console.log(response.data)
          localStorage.setItem('email', signupData.email)
          localStorage.removeItem('signupData') // Remove the signup data
          router.push('/verify')
        })
        .catch((error) => {
          console.error('Signup error:', error)
          // Handle signup error, e.g., show an error message
          alert('Signup failed. Please try again.')
        })
    }
  }, [router])

  return <div>Loading....</div>
}
