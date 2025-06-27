// src/components/ReviewModal.jsx

import React, { useState } from 'react';

const ReviewModal = ({ reviewData, onClose }) => {
  const [index, setIndex] = useState(0);
  const { questions, answers: correctAnswers } = reviewData;
  
  const userAnswer = reviewData.userAnswers?.[index]; // if provided

  const currentQ = questions[index];
  
  return (
    <div className="quiz-modal">
      <h3>Review {index + 1} of {questions.length}</h3>
      <p>{currentQ.question}</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {currentQ.options.map((opt, idx) => {
          const optionKey = opt[0].toLowerCase(); 
          const isUser = optionKey === userAnswer;
          const isCorrect = optionKey === correctAnswers[index];
          
          const style = {
            background: isCorrect ? '#d4edda' : isUser ? '#f8d7da' : 'transparent',
            padding: '0.5rem',
            borderRadius: '4px',
            margin: '0.25rem 0'
          };

          return <li key={idx} style={style}>
            <span>{opt}</span>
            {isCorrect && ' ✅'}
            {isUser && !isCorrect && ' ✗'}
          </li>;
        })}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        {index > 0 ? (
          <button className="btn" onClick={() => setIndex(index - 1)}>Back</button>
        ) : <div />}
        
        {index < questions.length - 1 ? (
          <button className="btn" onClick={() => setIndex(index + 1)}>Next</button>
        ) : (
          <button className="btn" onClick={onClose}>Close</button>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
