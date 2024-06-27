import React from 'react'
import {FaChalkboardTeacher, FaUserGraduate, FaCheckCircle, FaExclamationTriangle} from 'react-icons/fa';

import { useLoaderData, redirect } from 'react-router-dom';
import customFetch from '../components/customFetch';
import Wrapper from '../assets/wrappers/StatsContainer';
import { toast } from 'react-toastify';
import { StatItem } from '../components';


export const loader = async () => {
  try {
    const response = await customFetch.get('/users/admin/app-stats')
    return response.data
  } catch (error) {
    toast.error('You are not authorized to view this page')
    return redirect('/dashboard')
  }
}


const Admin = () => {
  const { adminUsers, regularUsers, verifiedJobs, unverifiedJobs } = useLoaderData()
  return (
    <Wrapper style={{ textAlign: 'center', marginLeft:'200px'}}>
      <div style={{alignContent:'center'}}>
        <h3 style={{marginBottom: '20px'}}>Users</h3>
        <StatItem title='teachers' count={adminUsers} color='#136bbd' bcg='#aed3f5' icon={<FaChalkboardTeacher />} />
        <br></br>
        <StatItem title='students' count={regularUsers} color='#f1c511' bcg='#efebbb' icon={<FaUserGraduate />} />
      </div>
      <div style={{alignContent:'center' }}>
        <h3 style={{marginBottom: '20px'}}>Tasks</h3>
        <StatItem title='verified' count={verifiedJobs} color='#129c20' bcg='#b1f3b8' icon={<FaCheckCircle />} />
        <br></br>
        <StatItem title='pending' count={unverifiedJobs} color='#e82020' bcg='#faa7a7' icon={<FaExclamationTriangle />} />
      </div>
    </Wrapper>

  )
}

export default Admin


