import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaUserGraduate } from 'react-icons/fa';
import { Form } from 'react-router-dom';
import Wrapper from '../assets/wrappers/Job';
import JobInfo from './JobInfo';
import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customFetch from '../components/customFetch';
import Modal2 from './Modal2';
import ChatWithDoc from './ChatWithDoc'; // ✅ Import Chat Component

day.extend(advancedFormat);

const Job = ({
  _id,
  text,
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
  const [modalType, setModalType] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // ✅ Chat Modal State

  const date = day(createdAt).format('MMM DD, YYYY');

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

  const handleAttemptQuiz = async () => {
    try {
      const response = await customFetch.post('/quiz/attempt', { _id });
      console.log('Quiz attempt successful:', response.data);
    } catch (error) {
      console.error('Error attempting quiz:', error);
    }
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
          <JobInfo icon={<FaUserGraduate />} text={userName} />

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

            {userRole === 'user' && (
              <>
                <button className="btn video-btn" onClick={handleAttemptQuiz}>
                  Attempt Quiz
                </button>

                <button className="btn quiz-btn" onClick={() => setIsChatOpen(true)}>
                  Chat with Doc
                </button>
              </>
            )}
          </footer>
        )}
      </div>

      {/* Modal Viewer */}
      {modalType && (
        <Modal2 onClose={() => setModalType(null)}>
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
        </Modal2>
      )}

      {/* ✅ Chat Modal */}
      {isChatOpen && (
        <Modal2 onClose={() => setIsChatOpen(false)}>
          <ChatWithDoc
            text={text} // or subjectName or a file summary
            initialPrompt="You are a helpful tutor. Explain the topic clearly and answer questions."
            onClose={() => setIsChatOpen(false)}
          />
        </Modal2>
      )}
    </Wrapper>
  );
};

export default Job;
