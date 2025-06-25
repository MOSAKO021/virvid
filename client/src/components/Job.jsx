import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaUserGraduate } from 'react-icons/fa';
import { Form } from 'react-router-dom';
import Wrapper from '../assets/wrappers/Job';
import JobInfo from './JobInfo';
import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customFetch from '../components/customFetch';
import Modal2 from './Modal2';
import ChatWithDoc from './ChatWithDoc';
import QuizModal from './QuizModal'; // ✅ Quiz component

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizStatus, setQuizStatus] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isQuizSolved, setIsQuizSolved] = useState(false);

  const date = day(createdAt).format('MMM DD, YYYY');
  const userRole = userData?.role;

  const getYoutubeId = (url) => {
    const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&]+)/;
    const match = url.match(regExp);
    return match && match[1] ? match[1] : '';
  };

  const handleAttemptQuiz = () => {
    setIsQuizOpen(true);
  };

  // ✅ Get teacher name
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

  // ✅ Check if quiz is solved using userData prop
  useEffect(() => {
    const solvedArray = userData?.solved || [];
    const solved = solvedArray.some(entry =>
      entry.contentId === _id || entry.contentId?._id === _id
    );
    console.log('Solved Array:', solvedArray);
    console.log('Is Quiz Solved:', solved);    
    setIsQuizSolved(solved);
  }, [userData, _id]);

  // ✅ Handle quiz evaluation
  useEffect(() => {
    const handleQuizEvaluated = (event) => {
      const result = event.detail;
      setQuizStatus(result);
      if (result.correctAnswers === result.totalQuestions) {
        setIsQuizSolved(true);
        setShowScoreModal(false);
      } else {
        setShowScoreModal(true);
      }
    };
    window.addEventListener('quizEvaluated', handleQuizEvaluated);
    return () => window.removeEventListener('quizEvaluated', handleQuizEvaluated);
  }, []);

  const getScoreColor = (score) => {
    if (score === 100) return 'green';
    if (score >= 60) return 'goldenrod';
    if (score >= 40) return 'orange';
    return 'red';
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

            {
            userRole === 'user' && (
              <>
                {isQuizSolved ? (
                  <span style={{ color: 'green', fontWeight: 'bold' }}>Quiz Solved</span>
                ) : (
                  <button
                    className="btn quiz-btn"
                    onClick={handleAttemptQuiz}
                    disabled={quizStatus?.correctAnswers === quizStatus?.totalQuestions}
                  >
                    Attempt Quiz
                  </button>
                )}

                <button className="btn quiz-btn" onClick={() => setIsChatOpen(true)}>
                  Chat with Doc
                </button>
              </>
            )}
          </footer>
        )}
      </div>

      {/* PDF/Video Modal */}
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

      {/* Quiz Modal */}
      {isQuizOpen && (
        <Modal2 onClose={() => setIsQuizOpen(false)}>
          <QuizModal jobId={_id} onClose={() => setIsQuizOpen(false)} />
        </Modal2>
      )}

      {/* Chat Modal */}
      {isChatOpen && (
        <Modal2 onClose={() => setIsChatOpen(false)}>
          <ChatWithDoc
            text={text}
            initialPrompt="You are a helpful tutor. Explain the topic clearly and answer questions."
            onClose={() => setIsChatOpen(false)}
          />
        </Modal2>
      )}

      {/* Score Modal */}
      {showScoreModal && quizStatus && (
        <Modal2 onClose={() => setShowScoreModal(false)}>
          <div style={{ textAlign: 'center' }}>
            <h3>Your Score</h3>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: getScoreColor(quizStatus.scorePercentage)
            }}>
              {quizStatus.scorePercentage}%
            </p>
            <p>You got {quizStatus.correctAnswers} out of {quizStatus.totalQuestions} correct.</p>
            <button className="btn" onClick={() => {
              setShowScoreModal(false);
              setIsQuizOpen(true);
            }}>
              Reattempt Quiz
            </button>
          </div>
        </Modal2>
      )}
    </Wrapper>
  );
};

export default Job;
