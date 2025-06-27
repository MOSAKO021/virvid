import React, { useEffect, useState, useRef } from 'react';
import customFetch from '../components/customFetch';

const LoadingDots = () => (
  <div className="ellipsis-loader"><span>.</span><span>.</span><span>.</span></div>
);

const QuizModal = ({ jobId, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  const hasFetchedRef = useRef(false); // ✅ used to prevent duplicate fetch

  useEffect(() => {
    const fetchQuiz = async () => {
      if (hasFetchedRef.current) return; // ✅ prevent duplicate request
      hasFetchedRef.current = true;

      try {
        const response = await customFetch.post('/quiz/attempt', { _id: jobId });
        setQuestions(response.data.questions);
        setQuizId(response.data.quizId);
        setSelectedAnswers(Array(response.data.questions.length).fill(null));
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [jobId]);

  const handleOptionChange = (e) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentIndex] = e.target.value;
    setSelectedAnswers(updatedAnswers);
  };

  const handleSave = () => {
    if (selectedAnswers[currentIndex] === null) {
      return alert('Please select an option before continuing.');
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (selectedAnswers.includes(null)) {
      return alert('Please answer all questions before submitting.');
    }

    try {
      const response = await customFetch.post('/quiz/evaluate', {
        quizId,
        submittedAnswers: selectedAnswers,
      });

      onClose();

      window.dispatchEvent(
        new CustomEvent('quizEvaluated', {
          detail: {
            ...response.data,
            userAnswers: selectedAnswers, // ✅ include user answers
          }
        })
      );
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz.');
    }
  };

  if (loading) return <LoadingDots />;

  const currentQ = questions[currentIndex];

  return (
    <div className="quiz-modal" style={{ padding: '1rem' }}>
      <h3>Question {currentIndex + 1} of {questions.length}</h3>
      <p style={{ marginBottom: '1rem' }}>{currentQ.question}</p>

      <form>
        {currentQ.options.map((option, idx) => (
          <label key={idx} style={{ display: 'block', margin: '8px 0' }}>
            <input
              type="radio"
              name={`q-${currentIndex}`}
              value={option[0].toLowerCase()}
              checked={selectedAnswers[currentIndex] === option[0].toLowerCase()}
              onChange={handleOptionChange}
            />
            {option}
          </label>
        ))}
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        {currentIndex > 0 ? (
          <button className="btn" onClick={handleBack}>Back</button>
        ) : <div />}

        {currentIndex < questions.length - 1 ? (
          <button className="btn" style={{ marginLeft: 'auto' }} onClick={handleSave}>Save</button>
        ) : (
          <button className="btn" style={{ marginLeft: 'auto' }} onClick={handleSubmit}>Submit</button>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
