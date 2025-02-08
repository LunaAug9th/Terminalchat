# TerminalChat Prototype

Hi, I'm Henry, the owner who was impressed by PySkywifi and created this repository
and This repository is a prototype of TerminalChat. I made it simpler than I originally planned.

## Getting Started

### Step 1: Set the Server Key
1. Open the `server.mjs` file.
2. Locate the following line in the fourth row:
   ```javascript
   let serverKey = ''; // Access hex key
   ```
3. Replace the empty string (`''`) with the key encoded in hex format.
4. Save and close the file in your editor.

### Step 2: Start the Server
Run one of the following commands to start the server:
```bash
node /<top folder of code>/server.mjs
```
or
```bash
node /home/<username>/TerminalChat/server.mjs
```

### Step 3: Start the Client
Run one of the following commands to start the client:
```bash
node /<top folder of code>/client.mjs
```
or
```bash
node /home/<username>/TerminalChat/client.mjs
```

## How to Use `client.mjs`

1. **Server Address:**
   - When prompted to enter the server address, do not include `https://` or `http://`.
   - Simply type the raw server address (e.g., `127.0.0.1:3000`).

2. **Server Key:**
   - Enter the hex-encoded key in the server key column when prompted.

3. **Sending Messages:**
   - Once connected without error, type your message and press the `Enter` key to send it.
---
### **URL formats:**
just a server:
(server address)/read?key=(hex key)
(server address)/send?key=(hex key)

Multi-channel server:
(server address)/(channel number)/read?key=(hex key)
(server address)/(channel number)/send?key=(hex key)

---
Enjoy using TerminalChat!
