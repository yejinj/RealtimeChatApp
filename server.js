const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const users = {};  // 간단한 사용자 저장소 (이메일을 키로 사용)
const sockets = {}; // 유저별 WebSocket 저장소
const SECRET_KEY = 'your_secret_key';

app.use(cors());
app.use(express.json());

// 회원가입
app.post('/signup', (req, res) => {
  const { email, username, password } = req.body;

  if (users[email]) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  users[email] = { username, password: hashedPassword };

  res.status(201).json({ message: 'User registered successfully' });
});

// 로그인
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users[email];
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ email, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

  res.status(200).json({ message: 'Login successful', token });
});

// WebSocket 연결
wss.on('connection', (ws, req) => {
    const token = req.url.split('?token=')[1];
    let email;
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      email = decoded.email;
      sockets[email] = ws; // 유저별 WebSocket 저장
    } catch (err) {
      ws.close();
      return;
    }
  
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        const { to, text } = parsedMessage;
      
        // 수신자가 연결되어 있는지 확인 후 메시지 전송
        if (sockets[to]) {
          console.log(`Sending message from ${email} to ${to}: ${text}`);
          sockets[to].send(JSON.stringify({ from: email, text }));
        } else {
          console.log(`User ${to} is not connected`);
          ws.send(JSON.stringify({ error: `User ${to} not connected` }));
        }
      });
  
    ws.on('close', () => {
      delete sockets[email]; // 연결 종료 시 소켓 제거
    });
  });
  

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(8080, () => {
  console.log('Server started on http://localhost:8080');
});
