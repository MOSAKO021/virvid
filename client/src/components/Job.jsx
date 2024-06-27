import React, { useEffect, useState } from 'react';
import { FaBriefcase, FaCalendarAlt, FaFilePdf } from 'react-icons/fa';
import { Form } from 'react-router-dom';
import Wrapper from '../assets/wrappers/Job';
import JobInfo from './JobInfo';
import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customFetch from '../components/customFetch';

day.extend(advancedFormat);

const Job = ({
  _id,
  topicName,
  subjectName,
  createdAt,
  verified,
  createdBy,
  standard,
  file
}) => {
  const [userName, setUserName] = useState('');
  const date = day(createdAt).format('MMM DD, YYYY');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await customFetch.get(`/getTeacher/getTeacher/${createdBy}`);
        setUserName(response.data.name);
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchUserName();
  }, [createdBy]);

  const openPdf = () => {
    window.open(`http://localhost:5200/${file}`, '_blank', 'toolbar=0,location=0,menubar=0');
  };

  return (
    <Wrapper>
      <header>
        <div className="main-icon">{standard}</div>
        <div className="info">
          <h5>{topicName}</h5>
          <p>{subjectName}</p>
        </div>
      </header>
      <div className="content">
        <div className="content-center">
          <JobInfo icon={<FaCalendarAlt />} text={date} />
          <span className="pdf-link" onClick={openPdf}>
            <FaFilePdf /> View PDF
          </span>
          <JobInfo icon={<FaBriefcase />} text={userName} />
          <div className={`status ${verified ? 'finished' : 'pending'}`}>
            {verified ? 'Verified✅' : 'Pending ☢️'}
          </div>
        </div>
        <footer className='actions'>
          <Form method='post' action={`../edit-job/${_id}`}>
            <button type='submit' className='btn edit-btn'>
              Verify
            </button>
          </Form>
          <Form method='post' action={`../delete-job/${_id}`}>
            <button type='submit' className='btn delete-btn'>
              Delete
            </button>
          </Form>
        </footer>
      </div>
    </Wrapper>
  );
};

export default Job;
