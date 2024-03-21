const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');
const { Client } = require('whatsapp-web.js');
const _ = require('lodash');
const bodyParser = require('body-parser');
const app = express();
const server = createServer(app);
const io = new Server(server);
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// Initialize WhatsApp client
const client = new Client();
client.on('qr', (qr) => {
    // Emit QR code to clients
    io.emit('qr', qr);
});
client.once('ready', () => {
    // Emit ready status to clients
    io.emit('ready', true);
});
client.initialize();

// Socket.IO connection event
io.on('connection', (socket) => {
    // Handle socket events if needed
});

// Express route for serving HTML file
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

// Express route for sending WhatsApp message
app.post('/message', async (req, res) => {
    const phone = req.body.phone ?? '';
    const message = req.body.message ?? '';
    if (_.isEmpty(phone) || _.isEmpty(message)) {
        res.status(500).json({ error: true, message: 'Phone number or message is not valid' });
    } else {
        try {
            await client.sendMessage(`${phone}@c.us`, message);
            res.status(200).json({ error: false, message: 'Message sent successfully' });
        } catch (error) {
            res.status(500).json({ error: true, message: 'Failed to send message' });
        }
    }
});

// Start the server
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
