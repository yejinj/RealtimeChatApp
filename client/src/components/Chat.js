import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Chat() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
  
    const socket = new WebSocket(`ws://localhost:8080?token=${token}`);
    
    // 수신한 메시지를 처리하는 부분
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };
  
    setWs(socket);
  
    return () => {
      if (socket) socket.close();
    };
  }, [navigate]);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ to: recipient, text: input });
      ws.send(message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { from: 'You', text: input }
      ]);
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.from === 'You' ? 'sent' : 'received'}`}>
            <strong>{message.from}:</strong> {message.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          className="recipient-input"
          placeholder="Recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          className="message-input"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="send-button" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
