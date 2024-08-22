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

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'message') {
        console.log('Received message:', message);
        setMessages((prevMessages) => [...prevMessages, message]);

        // 메시지를 읽었다는 신호를 서버로 보냄
        socket.send(JSON.stringify({
          to: message.from,
          type: 'read',
          text: message.text,
        }));
      }

      if (message.type === 'read') {
        console.log('Received read status:', message);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.text === message.text && msg.from === 'You' ? { ...msg, read: true } : msg
          )
        );
      }           

      if (message.type === 'delete') {
        console.log('Message deleted:', message);
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.text !== message.text)
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

      console.log('Sending message:', message);
      ws.send(JSON.stringify(message));
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...message, from: 'You', read: false },
      ]);
      setInput('');
    } else {
      console.error('WebSocket is not open. Cannot send message.');
    }
  };

  const deleteMessage = (messageText) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        to: recipient,
        text: messageText,
        type: 'delete',
      };

      console.log('Deleting message:', message);
      ws.send(JSON.stringify(message));
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.text !== messageText)
      );
    } else {
      console.error('WebSocket is not open. Cannot delete message.');
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.from === 'You' ? 'sent' : 'received'}`}>
            <div className="message-content">
              <strong>{message.from}:</strong> {message.text}
              {message.from === 'You' && message.read && <span className="read-status"> (Read)</span>}
            </div>
            {message.from === 'You' && (
              <button
                className="delete-button"
                onClick={() => deleteMessage(message.text)}
              >
                ✖
              </button>
            )}
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
