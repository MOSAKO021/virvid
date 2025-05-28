import React, { useEffect, useState } from 'react';
import { FaBriefcase, FaCalendarAlt } from 'react-icons/fa';
import { Form } from 'react-router-dom';
import Wrapper from '../assets/wrappers/Job';
import JobInfo from './JobInfo';
import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customFetch from '../components/customFetch';
import Modal from './Modal'; // Make sure Modal.js is in the correct path

day.extend(advancedFormat);

const Job = ({
  _id,
  topicName,
  subjectName,
  video,
  createdAt,
  verified,
  createdBy,
  standard,
  file,
  userData
}) => {
  const [userName, setUserName] = useState('');
  // const [userData, setUserData] = useState(userData);
  const [modalType, setModalType] = useState(null); // 'video' | 'pdf' | null

  const date = day(createdAt).format('MMM DD, YYYY');

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const response = await customFetch.get('/users/current-user');
  //       setUserData(response.data.user);
  //     } catch (error) {
  //       console.error('Error fetching user data:', error);
  //     }
  //   };
  //   if (!userData) {
  //   fetchUserData();
  // }
  // }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await customFetch.get(`/getTeacher/getTeacher/${createdBy}`);
        setUserName(response.data.name);
      } catch (error) {
        console.error('Error fetching teacher name:', error);
      }
    };
    fetchUserName();
  }, [createdBy]);

  const userRole = userData?.role;

  const getYoutubeId = (url) => {
    const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&]+)/;
    const match = url.match(regExp);
    return match && match[1] ? match[1] : '';
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
          <JobInfo icon={<FaBriefcase />} text={userName} />

          <button className="btn video-btn" onClick={() => setModalType('pdf')}>
            View PDF
          </button>

          {video && (
            <button className="btn video-btn" onClick={() => setModalType('video')}>
              {modalType === 'video' ? 'Hide Video' : 'Show Video'}
            </button>
          )}
        </div>

        {userData && (
          <footer className="actions">
            {userRole === 'legend' && (
              <Form method="post" action={`../edit-job/${_id}`}>
                <button type="submit" className="btn edit-btn">
                  Verify
                </button>
              </Form>
            )}

            {userRole !== 'user' && (
              <Form method="post" action={`../delete-job/${_id}`}>
                <button type="submit" className="btn delete-btn">
                  Delete
                </button>
              </Form>
            )}
          </footer>
        )}
      </div>

      {/* Modal Viewer */}
      {modalType && (
        <Modal onClose={() => setModalType(null)}>
          {modalType === 'video' && (
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(video)}`}
              title="YouTube Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {modalType === 'pdf' && (
            <iframe
              src={`http://localhost:5200/${file}`}
              title="PDF File"
            />
          )}
        </Modal>
      )}
    </Wrapper>
  );
};

export default Job;
