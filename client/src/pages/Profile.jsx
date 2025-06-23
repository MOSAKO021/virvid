import React from 'react';
import Wrapper from '../assets/wrappers/Profile';
import { useOutletContext, Form, redirect } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import customFetch from '../components/customFetch';
import { toast } from 'react-toastify';
import { FormRow, SubmitBtn } from '../components';

// Form action handler
export const action = async ({ request }) => {
  const formData = await request.formData();
  const dat = Object.fromEntries(formData);
  try {
    await customFetch.patch('/users/update-user', dat);
    toast.success('Password updated successfully');
    return redirect('/dashboard');
  } catch (error) {
    toast.error(error?.response?.data?.msg || 'Something went wrong');
    return null;
  }
};

// Profile component
const Profile = () => {
  const { user } = useOutletContext();
  const { name, email, role, standard } = user;

  return (
    <Wrapper>
      <div className="profile-container">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="icon-wrapper">
            <FaUserCircle size={64} className="profile-avatar" />
          </div>
          <h2 className="profile-title">Your Profile</h2>
          <div className="info-grid">
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Role:</strong> {role}</p>
            <p><strong>Standard:</strong> {standard === 0 ? 'Teacher' : standard}</p>
          </div>
        </div>

        {/* Password Reset Form */}
        <div className="card form-card">
          <h3 className="form-title">Reset Password</h3>
          <Form method="post" className="form">
            <FormRow
              type="password"
              id="password"
              name="password"
              labelText="New Password"
              required
            />
            <SubmitBtn formBtn />
          </Form>
        </div>
      </div>
    </Wrapper>
  );
};

export default Profile;
