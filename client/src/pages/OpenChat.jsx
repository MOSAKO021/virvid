import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import customFetch from '../utils/customFetch'; // Adjust the import path as necessary

const OpenChat = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [shouldScroll, setShouldScroll] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
  if (shouldScroll) {
    scrollToBottom();
    setShouldScroll(false); // reset after scrolling
  }
}, [chatHistory]);


  const sendMessage = async () => {
    setShouldScroll(false );

    if (!input.trim()) return;

    const newUserMessage = { role: 'user', content: input };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await customFetch.post('/chat', {
        messages: updatedHistory
      });

      const aiReply = res.data.response || 'No response';


      setChatHistory([...updatedHistory, { role: 'assistant', content: aiReply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory([...updatedHistory, {
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="open-chat-container">
      <header className="open-chat-header">
        <h2>AI Chat</h2>
      </header>

      <div className="open-chat-body">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant">
            <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <footer className="open-chat-footer">
        <input
          type="text"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className='btn' onClick={sendMessage}>Send</button>
      </footer>
    </div>
  );
};

export default OpenChat;
