const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const users = {};
const sockets = {};
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
    const { to, text, type } = parsedMessage;
  
    // 메시지를 수신자에게 전송
    if (type === 'message') {
      if (sockets[to]) {
        sockets[to].send(JSON.stringify({ from: email, text, type: 'message' }));
      } else {
        ws.send(JSON.stringify({ error: 'User not connected' }));
      }
    }
  
    // 읽음 상태 업데이트
    if (type === 'read') {
      if (sockets[to]) {
        console.log(`Sending read status to ${to} from ${email}`);  // 디버깅용 로그
        sockets[to].send(JSON.stringify({ from: email, type: 'read', text }));
      }
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
