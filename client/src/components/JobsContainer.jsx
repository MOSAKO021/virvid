import { useAllJobsContext } from '../pages/AllJobs';

import React, { useState, useEffect } from 'react';
import Job from './Job';
import Wrapper from '../assets/wrappers/JobsContainer';
import customFetch from '../components/customFetch';
import { useNavigate } from 'react-router-dom';

const JobsContainer = () => {
    const { data } = useAllJobsContext();
    // console.log(data, "ddaattaa");
    const { jobs } = data;
    // console.log("jjoobvss:", jobs);
    
    // console.log(jobs);  
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await customFetch.get('/users/current-user');
                setUserData(response.data.user);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    if (jobs.length === 0) {
        return (
            <Wrapper>
                <div className="no-jobs">
                    <h2>No Contents To Display</h2>
                    {userData?.role === 'admin' ? (
                        <button onClick={() => navigate('/dashboard/add-job')} className='btn form-btn'>
                            Add content
                        </button>
                    ) : (
                        <p>Contact a teacher to add more content!!!</p>
                    )}
                </div>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <div className="jobs">
                {jobs.map((job) => (
                    <Job key={job._id} {...job} />
                ))}
            </div>
        </Wrapper>
    );
};

export default JobsContainer;

