import http from 'http';

const CHANNEL_COUNT = 25; // 채널 개수 설정
const storedMessages = Array(CHANNEL_COUNT).fill(''); // 채널 메시지 저장
let serverKey = ''; // Access hex key

function validateKey(requestKey) {
  return requestKey === serverKey;
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const key = url.searchParams.get('key');
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length < 2 || pathSegments[0] !== 'channel') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Invalid path');
      return;
    }
    
    const channelNumber = parseInt(pathSegments[1], 10);
    if (isNaN(channelNumber) || channelNumber < 1 || channelNumber > CHANNEL_COUNT) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid channel number');
      return;
    }

    if (!validateKey(key)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Invalid key');
      return;
    }

    if (pathSegments[2]?.startsWith('send.')) {
      const hexMessage = pathSegments[2].split('.')[1];
      if (hexMessage) {
        try {
          storedMessages[channelNumber - 1] = hexMessage;
          const decodedMessage = Buffer.from(hexMessage, 'hex').toString('utf8');
          console.log(`Channel ${channelNumber} - Message received:`, decodedMessage);
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Message stored');
        } catch (err) {
          console.error('Error decoding message:', err);
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid Hex message');
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('No message provided');
      }
    } else if (pathSegments[2] === 'read') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(storedMessages[channelNumber - 1] || '');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  } catch (err) {
    console.error('Request handling error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
