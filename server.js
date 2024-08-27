const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User'); // User 모델 불러오기

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const SECRET_KEY = 'your_secret_key';
const sockets = {}; // 사용자별 WebSocket 연결 관리

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
    await User.create({
      email,
      username,
      password: hashedPassword,
      profilePicture: '',  // 빈 프로필 기본값
      bio: '',
      contactInfo: ''
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Error creating user', error });
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
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// 사용자 정보 조회
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['email', 'username'] });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: 'Error retrieving users', error });
  }
});

// 프로필 정보 조회
app.get('/profile', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const email = decoded.email;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
      contactInfo: user.contactInfo,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

// 프로필 수정
app.put('/profile', async (req, res) => {
  const { token, profilePicture, bio, contactInfo } = req.body;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const email = decoded.email;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = profilePicture;
    user.bio = bio;
    user.contactInfo = contactInfo;
    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error });
  }
});

// WebSocket 연결 관리 및 메시지 처리 로직
wss.on('connection', async (ws, req) => {
  const token = req.url.split('?token=')[1];
  let email;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    email = decoded.email;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      ws.close();
      return;
    }

    sockets[email] = ws; // 사용자별 WebSocket 저장
    console.log(`User ${user.username} connected`);

    ws.on('message', async (message) => {
      const parsedMessage = JSON.parse(message);
      const { to, text, type } = parsedMessage;
      const recipient = await User.findOne({ where: { email: to } });

      if (type === 'message') {
        if (sockets[to]) {
          console.log(`Sending message from ${user.username} to ${recipient.username}`);
          sockets[to].send(JSON.stringify({ from: user.username, text, type: 'message' }));
        } else {
          ws.send(JSON.stringify({ error: 'User not connected' }));
        }
      }

      if (type === 'read') {
        console.log(`Sending read status from ${user.username} to ${recipient.username}`);
        if (sockets[to]) {
          sockets[to].send(JSON.stringify({ from: user.username, text, type: 'read' }));
        } else {
          console.error('Recipient socket not found:', to);
        }
      }
      
      if (type === 'delete') {
        console.log(`Deleting message "${text}" from ${user.username}`);
        if (sockets[to]) {
          sockets[to].send(JSON.stringify({ from: user.username, text, type: 'delete' }));
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

// 전체 사용자 목록 조회 API
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['email', 'username', 'profilePicture', 'bio', 'contactInfo', 'mbti'],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: 'Error retrieving users', error });
  }
});


app.get('/profile/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

server.listen(8080, () => {
  console.log('Server started on http://localhost:8080');
});
