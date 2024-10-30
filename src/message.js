import { animation } from './animation_sprite.js'

export class MessageApp extends PIXI.Sprite {
  constructor(w, h, clientId) {
    super()

    this._w = w
    this._h = h

    // this.app = app
    // this.socket = socket
    this.clientId = clientId
    this.messages = []
    this.messageYPosition = 100 // メッセージの初期位置

    // メッセージ送信ボタンクリックイベント
    document
      .getElementById('sendBtn')
      .addEventListener('click', () => this.sendMessage())
  }

  async displayMessage(message, senderId, messageId) {
    const container = new PIXI.Container()
    container.id = messageId || `${this.clientId}-${Date.now()}`

    const isSelf = senderId === this.clientId
    container.animInstance = new animation()
    const anim = await container.animInstance.createAnimation(isSelf)

    let text = new PIXI.Text(message, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 'black',
      wordWrap: true,
      breakWords: true,
      wordWrapWidth: 250,
    })

    const textBounds = text.getLocalBounds()
    anim.width = textBounds.width + 40
    anim.height = textBounds.height + 30
    anim.x = isSelf ? this._w - (anim.width / 2 + 50) : 50 + anim.width / 2
    anim.y = this.messageYPosition

    text.anchor.set(0.5)
    text.x = anim.x
    text.y = anim.y

    container.addChild(anim)
    container.addChild(text)
    this.addChild(container)

    container.interactive = true
    container.buttonMode = true
    container.on('pointerdown', () => {
      if (senderId != this.clientId) {
        container.animInstance.playAnimation()
        console.log('send animationClick event')
        this.emit('animationClick', {
          messageId: container.id,
          senderId: senderId,
        })
      }
    })

    this.messageYPosition += anim.height + 20
    this.messages.push(container)
  }

  sendMessage() {
    let inputElement = document.getElementById('inputText')
    let inputText = inputElement.value.trim()

    console.log('sendMessage : ', inputText, this.clientId)
    if (inputText !== '') {
      const messageId = `${this.clientId}-${Date.now()}`
      this.emit('sendMessage', {
        message: inputText,
        clientId: this.clientId,
        messageId: messageId,
      })
      inputElement.value = ''
    }
  }

  handleAnimationClick(data) {
    console.log('handleAnimationClick', data)
    console.log(this.messages)
    console.log('send', data.messageId)

    //対象のコンテナを探す
    const container = this.messages.find(
      (message) => message.id == data.messageId
    )
    console.log(container, data.senderId, this.clientId)

    //コンテナの存在をチェック
    if (container) {
      // const animationSprite = container.children.find(child => child instanceof PIXI.AnimatedSprite);
      // if (animationSprite) {
      //     animationSprite.play();
      // }
      //アニメーション再生
      container.animInstance.playAnimation()
    }
  }

  setSize(w, h) {
    console.log(w, h)
    //todo 自分でサイズ変更かいて
  }
}
