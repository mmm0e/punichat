const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIo(server);

const PORT = 3000;

// express.staticを使用して静的ファイルを提供
app.use(express.static(__dirname));

// ルーティングの設定。'/' にリクエストがあった場合 src/index.html を返す
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index_chat.html');
});

// HTTPサーバーを起動
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

// クライアントとのコネクションが確立したら'connected'という表示させる
// サーバーへのアクセスを監視。アクセスがあったらコールバックが実行
io.on('connection', (socket) => {
  console.log('connected');

  let clientId;
  socket.on('registerClient', (id) => {
    clientId = id;
    console.log(`Client registered: ${clientId}`);
});
  
  // 受信
  socket.on('animationClick', (Data) => {
    //console.log('balls: ', ballsData);
    // io.emit('ballsupdate', ballsData);
    socket.broadcast.emit('animationClick', Data);
  });
  // クライアントからのボール生成イベントを受信し、他のクライアントに通知
  // socket.on('createSoftbody', (id) => {
  //   socket.broadcast.emit('createSoftbody', id);
  // });
});


