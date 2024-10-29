import { MessageApp } from "./message.js";

const socket = io();

let clientId = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + Date.now().toString(); 

socket.on('connect', () => {
    socket.emit('registerClient', clientId);
});

    const app = new PIXI.Application({
        antialias: true,
        autoStart: false,
        resizeTo: window,
        backgroundColor: 0x87CEEB
    });
    document.body.appendChild(app.view);

    //const graphics = new PIXI.Graphics(); 

    // // 吹き出しアニメーションをクリックしたら再生
    // const playAnimation = (anim) => {
    //     anim.gotoAndPlay(0);
    //     app.start();
    // }

    //メッセージアプリ部分
    // let messages = [];
    // let messageYPosition = 100; // メッセージの初期位置

    // メッセージを描画する関数
    // let displayMessage = (message, senderId, messageId) => {

    //     const container = new PIXI.Container();
    //     container.id = messageId || `${clientId}-${Date.now()}`;

    //     const isSelf = (senderId === clientId); // 自分のメッセージか判定
    //     const animation = isSelf ? greenAnimation : whiteAnimation;

    //     animation().then((anim) => {

    //         // テキストを追加
    //         let text = new PIXI.Text(message, {
    //             fontFamily: 'Arial',
    //             fontSize: 20,
    //             fill: 'black',
    //             wordWrap: true,
    //             breakWords: true,
    //             wordWrapWidth: 250
    //         });

    //         // 吹き出し背景をテキストのサイズに合わせて調整
    //         const textBounds = text.getLocalBounds();  // テキストの横幅、縦幅を取得
    //         anim.width = textBounds.width + 40;  // 吹き出しの幅をテキストに合わせる + 余白
    //         anim.height = textBounds.height + 30;

    //         // 自分のメッセージか相手のメッセージかで位置を調整
    //         anim.x = isSelf ? app.screen.width - (anim.width/2 + 50) : 50 + (anim.width/2);
    //         anim.y = messageYPosition;

    //         text.anchor.set(0.5);
    //         text.x = anim.x;
    //         text.y = anim.y;

    //         container.addChild(anim);
    //         container.addChild(text);
    //         app.stage.addChild(container);

    //         // 吹き出しをクリックでアニメーション再生
    //         container.interactive = true;
    //         container.buttonMode = true;

    //         container.on('pointerdown', () => {
    //             if (senderId !== clientId) {
    //                 playAnimation(anim);
    //                 // 他のクライアントにもクリック情報を送信
    //                 socket.emit('animationClick', { messageId: container.id, senderId });
    //             }
    //         });
    //         messageYPosition += anim.height + 20;

    //         messages.push(container);
    //     });
    // };

    // PIXIアプリケーション、ソケット、クライアントIDを用意
    const messageApp = new MessageApp(app, socket, clientId);

    //ボタンクリックで送信
    // document.getElementById('sendBtn').addEventListener('click', () => {
    //     let inputElement = document.getElementById('inputText');
    //     let inputText = inputElement.value.trim();
        
    //     if (inputText === "") {
    //         inputElement.value = ""; // テキストボックスの値を空にする
    //         inputElement.placeholder = "テキストを入力してください";
    //     } else {
    //         const messageId = `${clientId}-${Date.now()}`;
    //         socket.emit('sendMessage', { message: inputText, senderId: clientId, messageId });
    //         inputElement.value = '';
    //         inputElement.placeholder = "";
    //     }
    // });

    // メッセージ受信
    // socket.on('receiveMessage', (data) => {
    //     displayMessage(data.message, data.senderId, data.messageId); 
    // });

    // // 他のクライアントがアニメーションをクリックしたときに再生
    // socket.on('animationClick', (data) => {

    //     // 受信側の messages 配列から、該当するIDの吹き出しを探す
    //     const container = messages.find(msg => msg.id === data.messageId);
    //     if (container) {
    //         const animation = container.children.find(child => child instanceof PIXI.AnimatedSprite);
    //         if (animation) {
    //             playAnimation(animation);
    //         }
    //     }
    // });
    
    app.start()

    // キャンバスのリサイズに対応
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });


