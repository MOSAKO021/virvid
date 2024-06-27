import React from 'react'
import { toast } from 'react-toastify';
import { JobsContainer } from '../components';
import customFetch from '../components/customFetch';
import { useLoaderData } from 'react-router-dom';
import { useContext, createContext } from 'react';
import SearchContainer from '../components/SearchContainer';

export const loader = async({request}) => {
  const params = Object.fromEntries([
    ...new URL(request.url).searchParams.entries()
  ]);
  // console.log(params);
  try {
    const {data} = await customFetch.get('/jobs',{
      params,
    })
    // console.log(data,"fghhgfghgf");
    return {data, searchValues:{...params}}
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const AllJobsContext = createContext()

const AllJobs = () => {
  const {data, searchValues} = useLoaderData()
  return <AllJobsContext.Provider value={{data, searchValues}}> 
    <SearchContainer />
    <JobsContainer />
  </AllJobsContext.Provider>
}

export const useAllJobsContext = () => useContext(AllJobsContext)

export default AllJobs