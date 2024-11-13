import { MessageApp } from './message.js'

const socket = io()

let clientId =
  String.fromCharCode(97 + Math.floor(Math.random() * 26)) +
  Date.now().toString()

socket.on('connect', () => {
  socket.emit('registerClient', clientId)
})

const app = new PIXI.Application({
  antialias: true,
  autoStart: false,
  resizeTo: window,
  backgroundColor: 0x87ceeb,
})
document.body.appendChild(app.view)

// PIXIアプリケーション、ソケット、クライアントIDを用意
const messageApp = new MessageApp(window.innerWidth, window.innerHeight, clientId)

//document.getElementById('messageContainer').appendChild(app.view)  // PIXIキャンバスを表示

messageApp.on('animationClick', (data) => {
  console.log('animationClick', data)
  animationClick(data)
})
messageApp.on('sendMessage', (data) => {
  sendMessage(data)
})
app.stage.addChild(messageApp)

// 受信メッセージのソケットイベント
socket.on('receiveMessage', (data) => {
  console.log('receiveMessage', data)
  messageApp.displayMessage(data.message, data.clientId, data.messageId)
})

//他人が吹き出しをクリックしたイベントを受信
socket.on('animationClick', (data) => {
  messageApp.handleAnimationClick(data)
})

/*
 * 自分から他人にメッセージを送信するところ
 */
function sendMessage(params) {
  console.log('sendMessage,', params)
  socket.emit('sendMessage', {
    message: params.message,
    clientId: params.clientId,
    messageId: params.messageId,
  })
}

/*
 * 送信者側がアニメーションをクリックしたときの処理
 */
function animationClick(params) {
  console.log('sender animationClick', params)
  socket.emit('animationClick', {
    messageId: params.messageId,
    senderId: params.senderId,
  })
}

app.start()

// キャンバスのリサイズに対応
window.addEventListener('resize', () => {
  app.renderer.resize(window.innerWidth, window.innerHeight)
  messageApp.setSize(window.innerWidth, window.innerHeight)
})
