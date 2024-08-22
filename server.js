const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const SECRET_KEY = 'your_secret_key';
const users = {}; // 사용자 관리
const sockets = {}; // 사용자별 WebSocket 연결 관리

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

// 사용자 정보 조회
app.get('/users', (req, res) => {
  const userList = Object.keys(users).map((email) => ({
    email,
    username: users[email].username,
  }));

  res.status(200).json(userList);
});

// WebSocket 연결 관리 및 메시지 처리 로직
wss.on('connection', (ws, req) => {
  const token = req.url.split('?token=')[1];
  let email;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    email = decoded.email;
    const user = users[email];

    if (!user) {
      ws.close();
      return;
    }

    sockets[email] = ws; // 사용자별 WebSocket 저장
    console.log(`User ${user.username} connected`);

    ws.on('message', (message) => {
      const parsedMessage = JSON.parse(message);
      const { to, text, type } = parsedMessage;

      if (type === 'message') {
        if (sockets[to]) {
          console.log(`Sending message from ${user.username} to ${users[to].username}`);
          sockets[to].send(JSON.stringify({ from: user.username, text, type: 'message' }));
        } else {
          ws.send(JSON.stringify({ error: 'User not connected' }));
        }
      }

      if (type === 'read') {
        console.log(`Sending read status from ${user.username} to ${users[to].username}`);
        if (sockets[to]) {
          sockets[to].send(JSON.stringify({ from: user.username, text, type: 'read' }));
        }
      }
    });

    ws.on('close', () => {
      delete sockets[email];
      console.log(`User ${user.username} disconnected`);
    });

  } catch (err) {
    ws.close();
    console.error('WebSocket error:', err);
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(8080, () => {
  console.log('Server started on http://localhost:8080');
});
