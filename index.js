const express = require('express')
const app = express()
const fs = require('fs')

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const https = require('https').createServer(options, app)
const io = require('socket.io')(https)

const port = 3000

const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'))


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/pages/index.html')
})

var hostId = null

io.on('connect', (socket) => {
  socket.on('hostReady', () => {
    hostId = socket.id
    console.log(new Date().toLocaleString() + ' host ready ' + hostId)
  })

  socket.on('getSocketId', () => {
    io.sockets.to(socket.id).emit('returnSocketId', socket.id, hostId)
  })

  socket.on('requestStream', () => {
    console.log('request from ' + socket.id)
    io.sockets.to(hostId).emit('requestStream', socket.id)
  })

  socket.on('iceCandidate', candidate => {
    socket.broadcast.emit('iceCandidate', socket.id, candidate)
  })

  socket.on('peer', (id, desc) => {
    io.sockets.to(id).emit('peer', desc)
  })

  socket.on('peerAnswer', desc => {
    io.sockets.to(hostId).emit('peerAnswer', socket.id, desc)
  })
})

https.listen(port, () => {
  console.log('started server at port: ' + port)
})
