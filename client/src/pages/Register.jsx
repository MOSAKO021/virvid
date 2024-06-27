import React, { useState } from 'react';
import { Form, redirect, useNavigation, Link } from 'react-router-dom';
import Wrapper from '../assets/wrappers/RegisterAndLoginPage';
import { FormRow, SubmitBtn } from '../components';
import customFetch from '../components/customFetch';
import { toast } from 'react-toastify';

// Assuming STANDARDS is defined in constants.js
import { STANDARDS } from '../../../utils/constants';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  try {
    await customFetch.post('/auth/register', data);
    toast.success('Registration Successful');
    return redirect('/login');
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
};

const Register = () => {
  const [showStandardsDropdown, setShowStandardsDropdown] = useState(false);
  
  const handleRoleChange = (e) => {
    if (e.target.value === 'user') {
      setShowStandardsDropdown(true);
    } else {
      setShowStandardsDropdown(false);
    }
  };

  return (
    <Wrapper>
      <Form method='post' className='form'>
        <h4>REGISTER</h4>
        <FormRow type="text" name="name"  />
        <FormRow type="email" name="email"  />
        <FormRow type="password" name="password"  />
        <div className="form-group">
          <label>Role:</label>
          <div>
            <label>
              <input 
                type="radio" 
                name="role" 
                value="user" 
                onChange={handleRoleChange} 
              /> Student
            </label>
            <label>
              <input 
                type="radio" 
                name="role" 
                value="admin" 
                onChange={() => setShowStandardsDropdown(false)} 
              /> Teacher
            </label>
          </div>
        </div>
        {showStandardsDropdown && (
          <div className="form-group">
            <label>Select Standard:</label>
            <select name="standard">
              {STANDARDS.map((standard, index) => (
                <option key={index} value={standard}>{standard}</option>
              ))}
            </select>
          </div>
        )}
        <SubmitBtn />
        <p>
          Already a Member?
          <Link to='/login' className='member-btn'>Login</Link>
        </p>
      </Form>
    </Wrapper>
  );
};

export default Register;
