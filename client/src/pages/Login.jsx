import React from 'react'
import {Link, Form, redirect, useNavigation} from 'react-router-dom'
import Wrapper from '../assets/wrappers/RegisterAndLoginPage'
import { FormRow, SubmitBtn } from '../components'
import customFetch from '../components/customFetch'
import { toast } from 'react-toastify'

export const action = async ({request}) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  try {
    await customFetch.post('/auth/login', data)  
    toast.success('Login Successful')

    return redirect('/dashboard')
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    
    return error
  }
}

const Login = () => {
  return (
    <Wrapper>
      <Form method='post' className='form'>
        <h4>LOGIN</h4>
        <FormRow type='email' name='email'  />
        <FormRow type='password' name='password'  />
        <SubmitBtn />
        <p>Not a Member Yet ?          
        <Link to='/register' className='member-btn'>Register</Link>
        </p>
      </Form>
    </Wrapper>
  )
}
export default Login