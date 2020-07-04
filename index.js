const express = require('express')
const app = express()
const fs = require('fs')

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const https = require('https').createServer(options, app)
const io = require('socket.io')(https)

const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'))

const port = 3000

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/pages/index.html')
})

io.on('connect', (socket) => {
  // RTCPeerConnection
  socket.on('peerDesc', desc => {
    socket.broadcast.emit('peerDesc', desc)
  })

  socket.on('peerDescAnswer', desc => {
    socket.broadcast.emit('peerDescAnswer', desc)
  })

  socket.on('iceCandidate', candidate => {
    socket.broadcast.emit('iceCandidate', candidate)
  })
})

https.listen(port, () => {
  console.log('started server at port: 3000')
})
