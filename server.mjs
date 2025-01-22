import http from 'http';

let storedMessage = '';
let serverKey = ''; // Access hex key

function validateKey(requestKey) {
  return requestKey === serverKey;
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const key = url.searchParams.get('key');

    if (!validateKey(key)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Invalid key');
      return;
    }

    if (url.pathname.startsWith('/send.')) {
      const hexMessage = url.pathname.split('.')[1]; // extract Message
      if (hexMessage) {
        try {
          storedMessage = hexMessage;
          const decodedMessage = Buffer.from(hexMessage, 'hex').toString('utf8');
          console.log('Message received:', decodedMessage);
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
    } else if (url.pathname === '/read') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(storedMessage || '');
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
