const express = require('express');
const http = require('http');

// Socket.ioをインポート
const socketIo = require('socket.io');

const app = express();
const server = http.Server(app);

// 初期化 サーバーでSocket.IOを使える状態にする
const io = socketIo(server);

const PORT = 3000;

// ルーティングの設定。'/' にリクエストがあった場合 src/index.html を返す
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 3000番ポートでHTTPサーバーを起動
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

// クライアントとのコネクションが確立したら'connected'という表示させる
// サーバーへのアクセスを監視。アクセスがあったらコールバックが実行
io.on('connection', (socket) => {
  console.log('connected');

  // 'sendMessage' というイベント名で受信できる
  // 第一引数には受信したメッセージが入り、ログに出力する
  socket.on('sendMessage', (message) => {
    console.log('Message has been sent: ', message);
    
    // 'receiveMessage' というイベントを発火、受信したメッセージを全てのクライアントに対して送信する
    io.emit('receiveMessage', message);
  });

});

