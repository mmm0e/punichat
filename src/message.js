import { animation } from './animation_sprite.js'

export class MessageApp extends PIXI.Sprite {
  constructor(w, h, clientId) {
    super()
		
    this._w = w
    this._h = h
    this.clientId = clientId
    this.messages = []
    this.messageYPosition = 80 // メッセージの初期位置

    // スクロール可能なメッセージ一覧エリアをラップするコンテナ
    this.messageList = new PIXI.Container()
    this.messageList.y = 0
    this.addChild(this.messageList)

    // メッセージ送信ボタンクリックイベント
    document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage())
    document.getElementById('inputText').addEventListener('keydown', (e) => {
      if (e.isComposing || e.key === 229) {
        return;
      }else if (e.key === 'Enter') { 
        this.sendMessage()
      }
    })
  }

  async displayMessage(message, senderId, messageId) {

    const container = new PIXI.Container()
    container.id = messageId || `${this.clientId}-${Date.now()}`

    const isSelf = senderId === this.clientId
    container.animInstance = new animation()

    const anim = await container.animInstance.createAnimation(isSelf)

    let text = new PIXI.Text(message, {
      fontFamily: 'Arial',
      fontSize: 15,
      fill: 'black',
      wordWrap: true,
      breakWords: true,
      wordWrapWidth: 200,
    })

    const textBounds = text.getLocalBounds()
    anim.width = textBounds.width + 30
    anim.height = textBounds.height + 30
    anim.x = isSelf ? this._w - (anim.width / 2 + 50) : 50 + anim.width / 2
    anim.y = this.messageYPosition

    text.anchor.set(0.5)
    text.x = anim.x
    text.y = anim.y

    container.addChild(anim)
    container.addChild(text)
    //this.addChild(container)
    this.messageList.addChild(container) // メッセージ一覧に追加

    container.interactive = true
    container.buttonMode = true

    container.on('pointerdown', () => {
      if (senderId != this.clientId) {
        container.animInstance.playAnimation()
        console.log('send animationClick event')
        this.emit('animationClick', {messageId: container.id, senderId: senderId,})
      }
    })

    // タッチイベント
    container.on('touchstart', () => {
      if (senderId !== this.clientId) {
        container.animInstance.playAnimation();
        this.emit('animationClick', { messageId: container.id, senderId: senderId });
      }
    })

    this.messageYPosition += anim.height + 30
    this.messages.push(container)

		// メッセージ追加後に最新のメッセージが表示されるようにスクロール
    this.scrollToBottom()
  }

  scrollToBottom() {
    this.messageList.y = -Math.max(0, this.messageYPosition - this._h + 50)

    // メッセージリストをスクロール
    const messageContainer = document.getElementById('message-container');
    
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    } else {
        console.warn("message-containerが見つかりませんでした");
    }
    //messageContainer.scrollTop = messageContainer.scrollHeight;
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
      //アニメーション再生
      container.animInstance.playAnimation()
    }
  }

}
