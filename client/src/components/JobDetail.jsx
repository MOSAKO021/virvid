import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { FaCalendarAlt, FaUserGraduate, FaArrowLeft, FaDownload, FaCoins } from 'react-icons/fa';
import { Form } from 'react-router-dom';
import customFetch from '../components/customFetch';
import Modal2 from './Modal2';
import ChatWithDoc from './ChatWithDoc';
import QuizModal from './QuizModal';
import ReviewModal from './ReviewModal';
import { toast } from 'react-toastify';
import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

day.extend(advancedFormat);

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: userData } = useOutletContext();
  const [jobData, setJobData] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showPdf, setShowPdf] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizStatus, setQuizStatus] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isQuizSolved, setIsQuizSolved] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState(0);

  const DOWNLOAD_COST = 30; // Cost in coins to download PDF
  const BASE_QUIZ_REWARD = 45; // Base coins for 100% quiz completion

  // Calculate coin reward based on attempt number
  const calculateQuizReward = (attemptNumber) => {
    const reductionPercentage = (attemptNumber - 1) * 7; // 7% reduction per attempt after first
    const reductionFactor = Math.max(0, 100 - reductionPercentage) / 100;
    return Math.floor(BASE_QUIZ_REWARD * reductionFactor);
  };

  const handleQuizAttempt = () => {
    const nextAttempt = quizAttempts + 1;
    const potentialReward = calculateQuizReward(nextAttempt);
    
    const confirmQuiz = window.confirm(
      `Quiz Attempt Information:\n\n` +
      `• This is your attempt #${nextAttempt}\n` +
      `• Reward for 100% score: ${potentialReward} coins\n` +
      `• Each subsequent attempt reduces reward by 7%\n\n` +
      `Would you like to attempt the quiz?`
    );
    
    if (confirmQuiz) {
      setIsQuizOpen(true);
    }
  };

  const handleScoreModalClose = () => {
    setShowScoreModal(false);
    // Refresh page after quiz completion to update all data
    if (quizStatus?.shouldRefreshOnClose) {
      setTimeout(() => {
        window.location.reload();
      }, 100); // Small delay to ensure modal closes smoothly
    }
  };

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        // Fetch job data using the existing API endpoint
        const jobResponse = await customFetch.get(`/jobs/${id}`);
        setJobData(jobResponse.data.job);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching job data:', error);
        setError('Failed to load job details');
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      if (jobData?.createdBy) {
        try {
          const response = await customFetch.get(`/getTeacher/getTeacher/${jobData.createdBy}`);
          setUserName(response.data.name);
        } catch (error) {
          console.error('Error fetching teacher name:', error);
        }
      }
    };
    fetchUserName();
  }, [jobData?.createdBy]);

  useEffect(() => {
    if (userData && jobData) {
      const solvedArray = userData?.solved || [];
      
      // Only consider quiz solved if user has achieved perfect score (5/5)
      const solved = solvedArray.some(entry =>
        (entry.contentId === jobData._id || entry.contentId?._id === jobData._id) && entry.score === 5
      );
      setIsQuizSolved(solved);
      
      // Count quiz attempts for this specific content
      const attempts = solvedArray.filter(entry =>
        entry.contentId === jobData._id || entry.contentId?._id === jobData._id
      ).length;
      setQuizAttempts(attempts);
    }
  }, [userData, jobData]);

  useEffect(() => {
    const handleQuizEvaluated = (event) => {
      const result = event.detail;
      setQuizStatus(result);
      setShowScoreModal(true);
      
      // Update quiz attempts with the actual attempt number from backend
      if (result.attemptNumber) {
        setQuizAttempts(result.attemptNumber);
      }
      
      // Only mark as solved if user got perfect score (100%)
      if (result.scorePercentage === 100) {
        setIsQuizSolved(true);
      }
      
      // Set a flag to refresh page when score modal closes
      setQuizStatus(prev => ({ ...result, shouldRefreshOnClose: true }));
    };
    window.addEventListener('quizEvaluated', handleQuizEvaluated);
    return () => window.removeEventListener('quizEvaluated', handleQuizEvaluated);
  }, []);

  // Add CSS to prevent PDF toolbar and right-click
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .pdf-container iframe {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      .pdf-container {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const getYoutubeId = (url) => {
    const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&]+)/;
    const match = url.match(regExp);
    return match && match[1] ? match[1] : '';
  };

  const getScoreColor = (score) => {
    if (score === 100) return 'green';
    if (score >= 60) return 'goldenrod';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const handleDownloadPdf = async () => {
    // Only check coins for user role
    if (userRole === 'user' && userData.wallet < DOWNLOAD_COST) {
      toast.error(`Insufficient coins! You need ${DOWNLOAD_COST} coins to download this PDF.`);
      return;
    }

    // Show confirmation dialog only for users
    if (userRole === 'user') {
      const confirmDownload = window.confirm(
        `Download PDF for ${DOWNLOAD_COST} coins?\n\nYour current balance: ${userData.wallet} coins\nBalance after download: ${userData.wallet - DOWNLOAD_COST} coins`
      );
      
      if (!confirmDownload) {
        return;
      }
    }

    setIsDownloading(true);
    try {
      // Download PDF
      const pdfResponse = await customFetch.get(`/users/download/${jobData._id}`, {
        responseType: 'blob',
      });
      
      // Create blob link to download PDF
      const pdfUrl = window.URL.createObjectURL(new Blob([pdfResponse.data]));
      const pdfLink = document.createElement('a');
      pdfLink.href = pdfUrl;
      pdfLink.setAttribute('download', `${jobData.topicName}_${jobData.subjectName}.pdf`);
      document.body.appendChild(pdfLink);
      pdfLink.click();
      pdfLink.remove();
      window.URL.revokeObjectURL(pdfUrl);
      
      // Different success messages based on role
      if (userRole === 'user') {
        toast.success(`PDF downloaded successfully! ${DOWNLOAD_COST} coins deducted from your wallet.`);
        // Update user's wallet in the context (optional - for immediate UI update)
        if (userData) {
          userData.wallet -= DOWNLOAD_COST;
        }
      } else {
        toast.success('PDF downloaded successfully!');
      }
    } catch (error) {
      console.error('Download error:', error);
      if (error.response?.status === 403 && userRole === 'user') {
        toast.error('Insufficient coins to download this PDF.');
      } else {
        toast.error('Failed to download PDF. Please try again.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Error: {error || 'Job not found'}</h2>
        <button 
          className="btn" 
          onClick={() => navigate('/dashboard/all-jobs')}
          style={{ marginTop: '1rem' }}
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  const date = day(jobData.createdAt).format('MMM DD, YYYY');
  const userRole = userData?.role;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with back button */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="btn" 
          onClick={() => navigate('/dashboard/all-jobs')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
        >
          <FaArrowLeft /> Back
        </button>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'normal', color: '#333' }}>
            Topic: <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>{jobData.topicName}</span>
          </h1>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'normal', color: '#333' }}>
            Subject: <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>{jobData.subjectName}</span>
          </h2>
        </div>
      </div>

      {/* Info section */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaCalendarAlt />
          <span>Date: {date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaUserGraduate />
          <span>Uploaded by: {userName}</span>
        </div>
        <div>
          <span>Standard: {jobData.standard}</span>
        </div>
        {userData && userRole === 'user' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaCoins style={{ color: '#3f015c' }} />
            <span>Your Coins: {userData.wallet || 0}</span>
          </div>
        )}
      </div>

      {/* Quiz Reward Info Container */}
      {userData && userRole === 'user' && !isQuizSolved && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404',
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #ffeaa7',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1rem' }}>
            Score 100% on your quiz attempt to earn <strong>{calculateQuizReward(quizAttempts + 1)} coins</strong>!
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <button 
          className="btn" 
          onClick={() => setShowPdf(!showPdf)}
          style={{ 
            padding: '1rem', 
            fontSize: '1.1rem',
            backgroundColor: showPdf ? '#dc3545' : '#007BFF',
            color: '#fff'
          }}
        >
          {showPdf ? 'Hide PDF' : 'View PDF'}
        </button>

        {/* Download PDF Button */}
        {userData && userRole === 'user' ? (
          <button 
            className="btn" 
            onClick={handleDownloadPdf}
            disabled={!userData || userData.wallet < DOWNLOAD_COST || isDownloading}
            style={{ 
              padding: '1rem', 
              fontSize: '1.1rem',
              backgroundColor: (!userData || userData.wallet < DOWNLOAD_COST) ? '#6c757d' : '#17a2b8',
              color: '#fff',
              cursor: (!userData || userData.wallet < DOWNLOAD_COST) ? 'not-allowed' : 'pointer',
              opacity: (!userData || userData.wallet < DOWNLOAD_COST) ? 0.6 : 1,
              position: 'relative'
            }}
            title={(!userData || userData.wallet < DOWNLOAD_COST) ? 
              `You need ${DOWNLOAD_COST} coins to download this PDF. Current balance: ${userData?.wallet || 0}` : 
              `Download PDF - Costs ${DOWNLOAD_COST} coins`
            }
          >
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        ) : userData && (userRole === 'admin' || userRole === 'legend') && (
          <button 
            className="btn" 
            onClick={async () => {
              setIsDownloading(true);
              try {
                const pdfResponse = await customFetch.get(`/users/download/${jobData._id}`, {
                  responseType: 'blob',
                });
                
                const pdfUrl = window.URL.createObjectURL(new Blob([pdfResponse.data]));
                const pdfLink = document.createElement('a');
                pdfLink.href = pdfUrl;
                pdfLink.setAttribute('download', `${jobData.topicName}_${jobData.subjectName}.pdf`);
                document.body.appendChild(pdfLink);
                pdfLink.click();
                pdfLink.remove();
                window.URL.revokeObjectURL(pdfUrl);
                
                toast.success('PDF downloaded successfully!');
              } catch (error) {
                console.error('Download error:', error);
                toast.error('Failed to download PDF. Please try again.');
              } finally {
                setIsDownloading(false);
              }
            }}
            style={{ 
              padding: '1rem', 
              fontSize: '1.1rem',
              backgroundColor: '#17a2b8',
              color: '#fff'
            }}
          >
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        )}

        {jobData.video && (
          <button 
            className="btn" 
            onClick={() => setShowVideo(!showVideo)}
            style={{ 
              padding: '1rem', 
              fontSize: '1.1rem',
              backgroundColor: showVideo ? '#dc3545' : '#28a745',
              color: '#fff'
            }}
          >
            {showVideo ? 'Hide Video' : 'View Video'}
          </button>
        )}

        {userData && userRole === 'user' && (
          <>
            {isQuizSolved ? (
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#d4edda', 
                color: '#155724', 
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: 'bold',
                width: 'fit-content',
                minWidth: '200px',
                margin: '0 auto'
              }}>
                Quiz Solved ✓
              </div>
            ) : (
              <button 
                className="btn" 
                onClick={handleQuizAttempt}
                style={{ 
                  padding: '1rem', 
                  fontSize: '1.1rem',
                  backgroundColor: '#ffc107',
                  color: '#000'
                }}
              >
                Attempt Quiz
              </button>
            )}

            <button 
              className="btn" 
              onClick={() => setIsChatOpen(true)}
              style={{ 
                padding: '1rem', 
                fontSize: '1.1rem',
                backgroundColor: '#6f42c1',
                color: '#fff'
              }}
            >
              Chat with Doc
            </button>
          </>
        )}

        {userData && userRole === 'legend' && (
          <Form method="post" action={`../edit-job/${jobData._id}`}>
            <button 
              type="submit" 
              className="btn"
              style={{ 
                padding: '1rem', 
                fontSize: '1.1rem',
                backgroundColor: '#17a2b8',
                color: '#fff',
                width: '100%'
              }}
            >
              Verify
            </button>
          </Form>
        )}

        {userData && userRole !== 'user' && (
          <Form method="post" action={`../delete-job/${jobData._id}`}>
            <button 
              type="submit" 
              className="btn"
              style={{ 
                padding: '1rem', 
                fontSize: '1.1rem',
                backgroundColor: '#dc3545',
                color: '#fff',
                width: '100%'
              }}
            >
              Delete
            </button>
          </Form>
        )}
      </div>

      {/* Insufficient Balance Warning */}
      {userData && userRole === 'user' && userData.wallet < DOWNLOAD_COST && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #ffeaa7',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <FaCoins style={{ marginRight: '0.5rem', color: '#3f015c' }} />
          <strong>Insufficient Balance:</strong> You need {DOWNLOAD_COST} coins to download this PDF. 
          Your current balance is {userData.wallet || 0} coins. 
          Complete quizzes to earn more coins!
        </div>
      )}

      {/* Content Display Area */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: showPdf && showVideo ? '1fr 1fr' : '1fr',
        gap: '1rem',
        minHeight: '600px'
      }}>
        {showPdf && (
          <div 
            className="pdf-container"
            style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              overflow: 'hidden',
              backgroundColor: '#fff',
              position: 'relative'
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              toast.warning('Right-click is disabled. Use the Download button to save this PDF.');
              return false;
            }}
          >
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f8f9fa', 
              borderBottom: '1px solid #ddd',
              fontWeight: 'bold'
            }}>
              PDF Document - Preview Only
              <span style={{ 
                fontSize: '0.9rem', 
                fontWeight: 'normal', 
                color: '#856404', 
                marginLeft: '1rem' 
              }}>
                Use the Download button to save this PDF
              </span>
            </div>
            <div style={{ 
              position: 'relative',
              height: '550px',
              overflow: 'hidden'
            }}>
              <iframe 
                src={`http://localhost:5200/${jobData.file}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=85`}
                title="PDF File"
                style={{ 
                  width: '100%', 
                  height: '600px', 
                  border: 'none',
                  marginTop: '-30px'
                }}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        )}

        {showVideo && jobData.video && (
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            overflow: 'hidden',
            backgroundColor: '#fff'
          }}>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f8f9fa', 
              borderBottom: '1px solid #ddd',
              fontWeight: 'bold'
            }}>
              Video Content
            </div>
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(jobData.video)}`}
              title="YouTube Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ 
                width: '100%', 
                height: '550px', 
                border: 'none' 
              }}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {isQuizOpen && (
        <Modal2 onClose={() => setIsQuizOpen(false)}>
          <QuizModal 
            jobId={jobData._id} 
            onClose={() => setIsQuizOpen(false)} 
            attemptNumber={quizAttempts + 1}
          />
        </Modal2>
      )}

      {isChatOpen && (
        <Modal2 onClose={() => setIsChatOpen(false)}>
          <ChatWithDoc
            text={jobData.summary}
            initialPrompt="You are a helpful tutor. Explain the topic clearly and answer questions."
            onClose={() => setIsChatOpen(false)}
          />
        </Modal2>
      )}

      {showScoreModal && quizStatus && (
        <Modal2 onClose={handleScoreModalClose}>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>🎯 Your Score</h2>

            <p style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: getScoreColor(quizStatus.scorePercentage),
              margin: '0.5rem 0',
            }}>
              {quizStatus.scorePercentage}%
            </p>

            <p style={{ fontSize: '1.1rem', color: '#555' }}>
              You got <strong>{quizStatus.correctAnswers}</strong> out of{' '}
              <strong>{quizStatus.totalQuestions}</strong> correct.
            </p>

            {/* Coin Reward Display */}
            {quizStatus.scorePercentage === 100 && (
              <div style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '1rem',
                borderRadius: '8px',
                margin: '1rem 0',
                border: '1px solid #c3e6cb'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  🎉 Perfect Score Reward!
                </div>
                <div style={{ fontSize: '1.1rem' }}>
                  You earned <strong>{quizStatus.coinsEarned || calculateQuizReward(quizStatus.attemptNumber || quizAttempts + 1)} coins</strong>!
                </div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                  (Attempt #{quizStatus.attemptNumber || quizAttempts + 1})
                </div>
              </div>
            )}

            {quizStatus.scorePercentage < 100 && (
              <div style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '1rem',
                borderRadius: '8px',
                margin: '1rem 0',
                border: '1px solid #ffeaa7'
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  💰 Score 100% to earn coins!
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '2rem',
            }}>
              <button
                className="btn"
                style={{ padding: '0.5rem 1.5rem' }}
                onClick={handleScoreModalClose}
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
                        userAnswers: quizStatus.userAnswers,
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
    </div>
  );
};

export default JobDetail;
