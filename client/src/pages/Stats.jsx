import React from 'react'
import { StatsContainer } from '../components';
import customFetch from '../components/customFetch';
import { useLoaderData } from 'react-router-dom';
import { redirect } from 'react-router-dom';

export const loader = async () => {
  try {
    const response = await customFetch.get('/jobs/stats')
    return response.data
  } catch (error) {
    return error
  }
}

const Stats = () => {
  const {defaultStats} = useLoaderData()
  return (
    <>
    <StatsContainer defaultStats={defaultStats}  onClick={redirect('/dashboard')}/>
    </>
  )
}

export default Stats
