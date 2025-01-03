import http from 'http';
import readline from 'readline';

let lastSentMessage = ''; // Last Sended Message
let lastReceivedMessage = ''; // ast Received Message
let serverAddress = '';
let base16Key = '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function sendMessage(message) {
  if (message === lastSentMessage) {
    return;
  }

  lastSentMessage = message;
  const encodedMessage = Buffer.from(message, 'utf8').toString('hex');
  const url = `${serverAddress}/send.${encodedMessage}?key=${base16Key}`;

  http.get(url, (res) => {
    if (res.statusCode === 200) {
      console.log('Message sent!');
    } else {
      console.log(`Failed to send message. Status code: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}

function readMessages() {
  const url = `${serverAddress}/read?key=${base16Key}`;

  http.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (data && data !== lastReceivedMessage && data !== Buffer.from(lastSentMessage, 'utf8').toString('hex')) {
        lastReceivedMessage = data;
        const decodedMessage = Buffer.from(data, 'hex').toString('utf8');
        console.log(`RECEIVE: ${decodedMessage}`);
      }
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });

  setTimeout(readMessages, 250); // 250ms Delay Repeat
}

rl.question('Enter server address: ', (address) => {
  serverAddress = address.startsWith('http://') || address.startsWith('https://') 
    ? address 
    : `http://${address}`;

  rl.question('Enter Base16 key: ', (key) => {
    base16Key = key;
    console.log('Connecting to server...');

    // Start reading messages in a loop
    readMessages();

    rl.on('line', (input) => {
      sendMessage(input.trim());
    });
  });
});
