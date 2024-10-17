const socket = io();

// a-z のランダムな文字
let clientId = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + Date.now().toString(); 

socket.on('connect', () => {
    socket.emit('registerClient', clientId);
});

window.onload = ()=>{
    const app = new PIXI.Application({
        autoStart: false,
        resizeTo: window,
        backgroundColor: 0x87CEEB
    });
    document.body.appendChild(app.view);

    const greenAnimation = () =>{
        return PIXI.Assets.load("texture.json").then((spritesheet) => {
            const textures = [];

            for (let i = 1; i < 86; i++) {
                const framekey = `hukidashigreen (${i}).png`;
                const texture = spritesheet.textures[framekey];
                if (texture) {
                    textures.push(texture);
                }else{
                    //console.error(`Texture not found: ${framekey}`);
                    continue;
                }
            }

            const scaling = 0.5;
            const anim = new PIXI.AnimatedSprite(textures);

            anim.anchor.set(0.5);
            anim.scale.set(scaling);
            anim.animationSpeed = 0.5;
            anim.loop = false;  // 一度だけ再生する
            anim.gotoAndStop(0);  // 最初のフレームで停止
            app.stage.addChild(anim);
            return anim;
        });
    }

    const whiteAnimation = () =>{
        return PIXI.Assets.load("hukidashi_white.json").then((spritesheet) => {
            const textures2 = [];

            for (let i = 1; i < 86; i++) {
                const framekey2 = `hukidashi_white (${i}).png`;
                const texture2 = spritesheet.textures[framekey2];
                if (texture2) {
                    textures2.push(texture2);
                }else{
                    //console.error(`Texture not found: ${framekey2}`);
                    continue;
                }
            }

            const scaling = 0.5;
            const anim2 = new PIXI.AnimatedSprite(textures2);

            anim2.anchor.set(0.5);
            anim2.scale.set(scaling);
            anim2.animationSpeed = 0.5;
            anim2.loop = false;  // 一度だけ再生する
            anim2.gotoAndStop(0);  // 最初のフレームで停止
            app.stage.addChild(anim2);
            return anim2;
        });
    }

    // 吹き出しアニメーションをクリックしたら再生
    function playAnimation(anim) {
        anim.play();
        // anim.onComplete = () => {
        //     anim.gotoAndStop(0);  // 再生完了後、最初のフレームに戻す
        // };
        app.start();
    }

    //メッセージアプリ部分
    let messages = [];
    let messageYPosition = 100; // メッセージの初期位置

    // メッセージを描画する関数
    let displayMessage = (message, senderId) => {
        // 自分のメッセージか他人のメッセージかでアニメーションの色を変える
        const animation = (senderId === clientId) ? greenAnimation : whiteAnimation;

        animation().then((anim) => {
            // アニメーションを表示して背景に使用
            anim.x = 200;
            anim.y = messageYPosition + anim.height / 2;
            anim.gotoAndStop(0);  // 最初のフレームを停止状態で使用

            // テキストを追加
            let text = new PIXI.Text(message, {
                fontFamily: 'Arial',
                fontSize: 30,
                fill: 'black',
                wordWrap: true,
                wordWrapWidth: app.screen.width - 20
            });

            text.anchor.set(0.5);  // テキストの中心を設定

            anim.addChild(text);

            messages.push(anim);
            messageYPosition += anim.height + 20;

            // 吹き出しをクリックでアニメーション再生
            anim.interactive = true;
            anim.buttonMode = true;
            anim.on('pointerdown', () => {
                playAnimation(anim);

                // 他のクライアントにもクリック情報を送信
                socket.emit('animationClick', { senderId, x: anim.x, y: anim.y });
            });
        });
    };

    //ボタンクリックで送信
    document.getElementById('sendBtn').addEventListener('click', () => {
        let inputElement = document.getElementById('inputText');
        let inputText = inputElement.value.trim();

        if (inputText === "") {
            inputElement.value = ""; // テキストボックスの値を空にする
            inputElement.placeholder = "テキストを入力してください";
        } else {
            displayMessage(inputText, clientId);
            socket.emit('sendMessage', { message: inputText, senderId: clientId });
            inputElement.value = ''; // 入力フィールドをクリア
            inputElement.placeholder = "";
        }
    });

    // メッセージ受信
    socket.on('receiveMessage', (data) => {
        displayMessage(data.message, data.senderId); 
    });

    // 他のクライアントがアニメーションをクリックしたときに再生
    socket.on('animationClick', (data) => {
        if (data.senderId !== clientId) {
            greenAnimation().then((anim) => {
                anim.x = data.x;
                anim.y = data.y;
                playAnimation(anim);  // 他のクライアントの位置でアニメーション再生
            });
        }
    });

    app.ticker.add(() => {
    });

    // キャンバスのリサイズに対応
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });

};
