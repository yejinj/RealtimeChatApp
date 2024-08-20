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
  
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
  
      if (message.type === 'message') {
        setMessages((prevMessages) => [...prevMessages, message]);
  
        // 메시지를 읽었다는 신호를 서버로 보냄
        socket.send(JSON.stringify({
          to: message.from,
          type: 'read',
          text: message.text,  // 메시지 텍스트를 포함하여 서버에 전송
        }));
      }
  
      if (message.type === 'read') {
        console.log('Received read status:', message);  // 디버깅용 로그
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.from === 'You' && msg.text === message.text
              ? { ...msg, read: true }
              : msg
          )
        );
      }
    };
  
    setWs(socket);
  
    return () => {
      if (socket) socket.close();
    };
  }, [navigate]);
  
  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        to: recipient,
        text: input,
        type: 'message',
      };
  
      ws.send(JSON.stringify(message));
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...message, from: 'You', read: false },
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
            {message.from === 'You' && message.read && <span className="read-status"> (Read)</span>}
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
