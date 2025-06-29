import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaUserGraduate } from 'react-icons/fa';
import { Form } from 'react-router-dom';
import Wrapper from '../assets/wrappers/Job';
import JobInfo from './JobInfo';
import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customFetch from '../components/customFetch';
import Modal2 from './Modal2';
import Modal from './Modal';
import ChatWithDoc from './ChatWithDoc';
import QuizModal from './QuizModal';
import ReviewModal from './ReviewModal';

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
  const [reviewData, setReviewData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

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

  useEffect(() => {
    const solvedArray = userData?.solved || [];
    const solved = solvedArray.some(entry =>
      entry.contentId === _id || entry.contentId?._id === _id
    );
    setIsQuizSolved(solved);
  }, [userData, _id]);

  useEffect(() => {
    const handleQuizEvaluated = (event) => {
      const result = event.detail;
      setQuizStatus(result);
      setUserAnswers(result.userAnswers); // ✅ store user answers
      setShowScoreModal(true);
      if (result.correctAnswers === result.totalQuestions) {
        setIsQuizSolved(true);
      }
    };
    window.addEventListener('quizEvaluated', handleQuizEvaluated);
    return () => window.removeEventListener('quizEvaluated', handleQuizEvaluated);
  }, []);


  const handleReview = async () => {
    try {
      const res = await customFetch.get(`/quiz/review/${quizStatus.quizId}`);
      setReviewData(res.data);
      setShowScoreModal(false);
      setIsReviewOpen(true);
    } catch (err) {
      console.error('Quiz review failed', err);
    }
  };

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
                <button type="submit" className="btn edit-btn">Verify</button>
              </Form>
            )}

            {userRole !== 'user' && (
              <Form method="post" action={`../delete-job/${_id}`}>
                <button type="submit" className="btn delete-btn">Delete</button>
              </Form>
            )}

            {userRole === 'user' && (
              <>
                {isQuizSolved ? (
                  <span style={{ color: 'green', fontWeight: 'bold' }}>Quiz Solved</span>
                ) : (
                  <button className="btn quiz-btn" onClick={handleAttemptQuiz}>Attempt Quiz</button>
                )}

                <button className="btn quiz-btn" onClick={() => setIsChatOpen(true)}>
                  Chat with Doc
                </button>
              </>
            )}
          </footer>
        )}
      </div>

      {modalType && (
        <Modal   onClose={() => setModalType(null)}>
          {modalType === 'video' ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(video)}`}
              title="YouTube Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <iframe src={`http://localhost:5200/${file}`} title="PDF File" />
          )}
        </Modal>
      )}

      {isQuizOpen && (
        <Modal2 onClose={() => setIsQuizOpen(false)}>
          <QuizModal jobId={_id} onClose={() => setIsQuizOpen(false)} />
        </Modal2>
      )}

      {isChatOpen && (
        <Modal2 onClose={() => setIsChatOpen(false)}>
          <ChatWithDoc
            text={text}
            initialPrompt="You are a helpful tutor. Explain the topic clearly and answer questions."
            onClose={() => setIsChatOpen(false)}
          />
        </Modal2>
      )}

      {showScoreModal && quizStatus && (
        <Modal2 onClose={() => setShowScoreModal(false)}>
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            <h2 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>🎯 Your Score</h2>

            <p
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: getScoreColor(quizStatus.scorePercentage),
                margin: '0.5rem 0',
              }}
            >
              {quizStatus.scorePercentage}%
            </p>

            <p style={{ fontSize: '1.1rem', color: '#555' }}>
              You got <strong>{quizStatus.correctAnswers}</strong> out of{' '}
              <strong>{quizStatus.totalQuestions}</strong> correct.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '2rem',
              }}
            >
              <button
                className="btn"
                style={{ padding: '0.5rem 1.5rem' }}
                onClick={() => setShowScoreModal(false)}
              >
                Okay
              </button>

              {quizStatus.scorePercentage < 100 && (
                <button
                  className="btn"
                  style={{
                    padding: '0.5rem 1.5rem',
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    border: 'none',
                  }}
                  onClick={async () => {
                    try {
                      const res = await customFetch.get(`/quiz/review/${quizStatus.quizId}`);
                      setReviewData({
                        ...res.data,
                        userAnswers: quizStatus.userAnswers, // Pass user answers from event
                      });
                      setShowScoreModal(false);
                    } catch (error) {
                      console.error("Review fetch failed:", error);
                    }
                  }}
                >
                  Review Answers
                </button>
              )}
            </div>
          </div>
        </Modal2>
      )}


      {reviewData && (
        <Modal2 onClose={() => setReviewData(null)}>
          <ReviewModal reviewData={reviewData} onClose={() => setReviewData(null)} />
        </Modal2>
      )}


      {isReviewOpen && reviewData && (
        <Modal2 onClose={() => setIsReviewOpen(false)}>
          <ReviewModal reviewData={reviewData} onClose={() => setIsReviewOpen(false)} />
        </Modal2>
      )}
    </Wrapper>
  );
};

export default Job;
