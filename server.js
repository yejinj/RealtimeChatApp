const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User'); // User 모델 가져오기

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const SECRET_KEY = 'your_secret_key';

app.use(cors());
app.use(express.json());

// 회원가입
app.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = await User.create({ email, username, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// 로그인
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ email, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// WebSocket 연결 관리 및 메시지 처리 로직 (이전과 동일)
wss.on('connection', (ws, req) => {
  const token = req.url.split('?token=')[1];
  let email;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    email = decoded.email;
    sockets[email] = ws;
  } catch (err) {
    ws.close();
    return;
  }

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    const { to, text, type } = parsedMessage;

    if (type === 'message') {
      if (sockets[to]) {
        sockets[to].send(JSON.stringify({ from: email, text, type: 'message' }));
      } else {
        ws.send(JSON.stringify({ error: 'User not connected' }));
      }
    }

    if (type === 'read') {
      if (sockets[to]) {
        sockets[to].send(JSON.stringify({ from: email, text: 'read', type: 'read' }));
      }
    }
  });

  ws.on('close', () => {
    delete sockets[email];
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(8080, () => {
  console.log('Server started on http://localhost:8080');
});