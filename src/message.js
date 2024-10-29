import { animation } from "./animation_sprite.js";

export class MessageApp {
    constructor(app, socket, clientId) {
        this.app = app;
        this.socket = socket;
        this.clientId = clientId;
        this.messages = [];
        this.messageYPosition = 100; // メッセージの初期位置

        // メッセージ送信ボタンクリックイベント
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());

        // 受信メッセージのソケットイベント
        this.socket.on('receiveMessage', (data) => {
            this.displayMessage(data.message, data.senderId, data.messageId);
        });

        // 他クライアントからのアニメーション再生リクエストの処理
        this.socket.on('animationClick', (data) => this.handleAnimationClick(data));
    }

    async displayMessage(message, senderId, messageId) {
        const container = new PIXI.Container();
        container.id = messageId || `${this.clientId}-${Date.now()}`;
        
        const isSelf = senderId === this.clientId;
        const animInstance = new animation(this.app);
        const anim = await animInstance.createAnimation(isSelf);

        let text = new PIXI.Text(message, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 'black',
            wordWrap: true,
            breakWords: true,
            wordWrapWidth: 250
        });

        const textBounds = text.getLocalBounds();
        anim.width = textBounds.width + 40;
        anim.height = textBounds.height + 30;
        anim.x = isSelf ? this.app.screen.width - (anim.width / 2 + 50) : 50 + (anim.width / 2);
        anim.y = this.messageYPosition;

        text.anchor.set(0.5);
        text.x = anim.x;
        text.y = anim.y;

        container.addChild(anim);
        container.addChild(text);
        this.app.stage.addChild(container);

        container.interactive = true;
        container.buttonMode = true;
        container.on('pointerdown', () => {
            if (senderId !== this.clientId) {
                animInstance.playAnimation();
                this.socket.emit('animationClick', { messageId: container.id, senderId });
            }
        });

        this.messageYPosition += anim.height + 20;
        this.messages.push(container);
    }

    sendMessage() {
        let inputElement = document.getElementById('inputText');
        let inputText = inputElement.value.trim();

        if (inputText !== "") {
            const messageId = `${this.clientId}-${Date.now()}`;
            this.socket.emit('sendMessage', { message: inputText, senderId: this.clientId, messageId });
            inputElement.value = '';
        }
    }

    handleAnimationClick(data) {
        const container = this.messages.find(msg => msg.id === data.messageId);
        if (container && data.senderId !== this.clientId) {
            // const animationSprite = container.children.find(child => child instanceof PIXI.AnimatedSprite);
            // if (animationSprite) {
            //     animationSprite.play();
            // }
            message.animInstance.playAnimation();
        }
    }
}