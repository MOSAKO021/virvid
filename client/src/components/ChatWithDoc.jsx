import React, { useState } from 'react';
import ai_api from '../utils/ai_api';
import ReactMarkdown from 'react-markdown';
// import '../assets/styles/ChatWithDoc.css';

const ChatWithDoc = ({ text, initialPrompt, onClose }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);

    const userVisibleMessage = input;
    const appendedInstruction = `\n\nOnly respond to questions that are relevant to the topic or document provided. If this is unrelated, reply with: "Please ask questions relevant to the topic or document only."`;

    const contextMessages = chatHistory.length === 0
      ? [
          {
            role: 'user',
            content: `${initialPrompt}\n\n${text}`
          }
        ]
      : [];

    // Actual messages sent to AI
    const updatedHistoryForAI = [
      ...chatHistory,
      { role: 'user', content: `${userVisibleMessage}${appendedInstruction}` }
    ];

    // Clean history shown to user
    setChatHistory(prev => [...prev, { role: 'user', content: userVisibleMessage }]);
    setInput('');

    try {
      const { response } = await ai_api([...contextMessages, ...updatedHistoryForAI]);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('Error getting AI response:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-modal">
      <div className="chat-header">
        <h3>Chat with Doc</h3>
        <button onClick={onClose}></button>
      </div>

      <div className="chat-body">
        {chatHistory.length === 0 && (
          <div className="chat-placeholder">
            <p><em>Ask your doubts about this topic...</em></p>
          </div>
        )}

        {chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}

        {loading && (
          <div className="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        )}
      </div>

      <div className="chat-footer">
        <input
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWithDoc;
