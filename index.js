const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { Client } = require('whatsapp-web.js');
const _ = require('lodash');

const app = express();
const server = createServer(app);
const io = new Server(server);


io.on('connection', (socket) => {
    const client = new Client();
    client.on('qr', (qr) => {
        socket.emit('qr', qr);
    });
    client.once('ready', () => {
        socket.emit('ready', true);
    });
    client.initialize();

    io.on('sendMessage', async(d) => {
        await client.sendMessage(d.phone, d.message);
    })
});



app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});


app.get('/message', (req, res) => {
  const phone = req.query.phone ?? '';
  const message = req.query.message ?? '';
  if(_.isEmpty(phone) || _.isEmpty(message)) {
    res.status(403).json({error: true, message: 'Phone number or message is not valid'});
  } else {
    io.emit('sendMessage', { phone: phone, message: message });
    res.status(200).json({error: false, message: 'Message sent successfully'});
  }
});



server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});