import React, { useState } from 'react';
import Wrapper from '../assets/wrappers/DashboardFormPage';
import { useOutletContext, Form, redirect } from 'react-router-dom';
import { FaUser } from 'react-icons/fa'; // Assuming you're using Font Awesome for icons
import customFetch from '../components/customFetch';
import { toast } from 'react-toastify';
import { FormRow, SubmitBtn } from '../components';


export const action = async ({ request }) => {
  const formData = await request.formData();
  const dat = Object.fromEntries(formData);
  try {
    await customFetch.patch('/users/update-user', dat);
    toast.success("Password updated successfully");
    return redirect('/dashboard');
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return null;
  }
}

const Profile = () => {
  const { user } = useOutletContext();
  const { name, email, role, standard } = user;

  return (
    <div>
      <Wrapper>
        <div className="profile-header">
          <FaUser size={24} className="profile-icon" />
          <div className="user-info">
            <p>{`Name: ${name}`}</p>
            <p>{`Email: ${email}`}</p>
            <p>{`Role: ${role}`}</p>
            <p>{`Standard: ${standard === 0 ? "Teacher" : standard}`}</p>
          </div>
        </div>
      </Wrapper>
      <div className="password-container" >
        <br/ >
        <br/ >
        <br/ >
        <Form method='post' className='form' >
          <div className="form-group">
            <label htmlFor="password">Reset Your Password</label>
            <FormRow type='password' id='password' name='password' required /> 
          </div>
          <SubmitBtn formBtn />
        </Form>
      </div>
    </div>
  );
};

export default Profile;
