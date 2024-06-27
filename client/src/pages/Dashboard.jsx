import React, { useEffect, useState } from 'react';
import { Outlet, redirect, useLoaderData, useNavigate } from 'react-router-dom';
import legend from './legend.png';


export const loader = async () => {
  try {
    const { data } = await customFetch.get('/users/current-user');
    return data;
  } catch (error) {
    return redirect('/');
  }
};

const DateTimeDisplay = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
      <p style={{ fontSize: '200%', fontWeight: 'bold', margin: '50px 0' }}>
        Date:        {currentDateTime.toLocaleDateString()}
      </p>
      <p style={{ fontSize: '180%', fontWeight: 'bold', margin: '50px 0' }}>
        Time:        {currentDateTime.toLocaleTimeString()}
      </p>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useLoaderData();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/dashboard/all-jobs');
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
        Welcome,  {user && user.name}
      </p>
      {user && user.role === 'legend' && (
        <p style={{ fontSize: '30px', fontStyle: 'italic', marginBottom: '20px' }}>
          With Great Power Comes Great Responsibility...
          <img src={legend}  alt="Legend" style={{ maxWidth: '100%', marginBottom: '20px' }} />
        </p>
      )}
      <DateTimeDisplay />
      {user && user.role === 'user' && (
        <button
          style={{
            padding: '10px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={handleButtonClick}
        >
          Start Studying
        </button>
      )}
    </div>
  );
};

export default Dashboard;
