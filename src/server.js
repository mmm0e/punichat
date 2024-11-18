const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
const PORT = 3000
const HOST = '0.0.0.0'  // 全てのIPアドレスからのアクセスを許可

const server = http.createServer(app)
const io = socketIo(server)

// express.staticを使用して静的ファイルを提供
app.use(express.static(__dirname));

// ルーティングの設定。'/' にリクエストがあった場合 src/index.html を返す
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index_chat.html');
});

// HTTPサーバーを起動
server.listen(PORT, HOST, () => {
  console.log(`listening on http://${HOST}:${PORT}`);
});

// サーバーへのアクセスを監視。アクセスがあったらコールバックが実行
io.on('connection', (socket) => {
  	console.log("A user connected:", socket.id);
	
	socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });

	socket.on('registerClient', (id) => {
		console.log(`Client registered: ${id}`);
	});

	socket.on('sendMessage', (message) => {
		console.log('Message has been sent: ', message);
		io.emit('receiveMessage', message);
	});
	
	socket.on('animationClick', (data) => {
		socket.broadcast.emit('animationClick', data);
	});

});


