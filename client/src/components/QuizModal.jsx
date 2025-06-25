// src/components/QuizModal.jsx

import React, { useEffect, useState } from 'react';
import customFetch from '../components/customFetch';

const LoadingDots = () => (
  <div className="ellipsis-loader">Loading<span>.</span><span>.</span><span>.</span></div>
);

const QuizModal = ({ jobId, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
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

  const handleSubmit = async () => {
    if (selectedAnswers.includes(null)) {
      return alert('Please answer all questions before submitting.');
    }
    try {
      const response = await customFetch.post('/quiz/evaluate', {
        quizId,
        submittedAnswers: selectedAnswers,
      });

      onClose(); // Close quiz modal
      // Dispatch quiz evaluation result
      window.dispatchEvent(
        new CustomEvent('quizEvaluated', { detail: response.data })
      );
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz.');
    }
  };

  if (loading) return <LoadingDots />;

  const currentQ = questions[currentIndex];

  return (
    <div className="quiz-modal">
      <h3>Question {currentIndex + 1} of {questions.length}</h3>
      <p>{currentQ.question}</p>

      <form>
        {currentQ.options.map((option, idx) => (
          <label key={idx} style={{ display: 'block', margin: '8px 0' }}>
            <input
              type="radio"
              name={`q-${currentIndex}`}
              value={option[0].toLowerCase()} // 'a', 'b', etc.
              checked={selectedAnswers[currentIndex] === option[0].toLowerCase()}
              onChange={handleOptionChange}
            />
            {option}
          </label>
        ))}
      </form>

      <div style={{ marginTop: '1rem' }}>
        {currentIndex < questions.length - 1 ? (
          <button className="btn" onClick={handleSave}>Save</button>
        ) : (
          <button className="btn" onClick={handleSubmit}>Submit</button>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
