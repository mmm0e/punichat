const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const app = express()
const server = http.Server(app)
const io = socketIo(server)

const PORT = 3000

// express.staticを使用して静的ファイルを提供
app.use(express.static(__dirname))

// ルーティングの設定。'/' にリクエストがあった場合 src/index.html を返す
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index_chat.html')
})

// HTTPサーバーを起動
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})

// クライアントとのコネクションが確立したら'connected'という表示させる
// サーバーへのアクセスを監視。アクセスがあったらコールバックが実行
io.on('connection', (socket) => {
  	console.log('connected');
	// 受信
	let clientId;
	socket.on('registerClient', (id) => {
		clientId = id;
		console.log(`Client registered: ${clientId}`);
	});

	socket.on('sendMessage', (message) => {
		console.log('Message has been sent: ', message);
		io.emit('receiveMessage', message);
	});
	
	socket.on('animationClick', (Data) => {
		socket.broadcast.emit('animationClick', Data);
	});

});


