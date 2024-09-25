let messages = [];

window.onload = ()=>{
    const app = new PIXI.Application({
        autoStart: false,
        resizeTo: window,
        backgroundColor: 0x87CEEB
    });
    document.body.appendChild(app.view);

    // const socket = io();
    // // a-z のランダムな文字
    // let clientId = String.fromCharCode(97 + Math.floor(Math.random() * 26)); 

    const setupAnimation = () =>{
        return PIXI.Assets.load("texture.json").then((spritesheet) => {
        const textures = [];
        for (let i = 1; i < 86; i++) {
            const framekey = `hukidashigreen (${i}).png`;
            const texture = spritesheet.textures[framekey];
            //const time = frameData ? frameData.duration : 100; // デフォルト値を 100 に設定
            if (texture) {
                textures.push(texture);
            }else{
                console.error(`Texture not found: ${framekey}`);
                continue;
            }
        }

        const scaling = 1;
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

    // 吹き出しアニメーションをクリックしたら再生
    function playAnimation(x, y) {
        setupAnimation().then((anim) => {
            anim.x = x;
            anim.y = y;
            anim.play();
            anim.onComplete = () => {
                anim.gotoAndStop(0); // 再生完了後、最初のフレームに戻す
            };
            app.start();
        });
    }

    //メッセージアプリ部分
    let isMySelf = true;
    let sendBtn = document.getElementById('sendBtn');

    // テキスト
    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 'black',
        wordWrap: true,
        wordWrapWidth: app.screen.width - 20,
    });

    let messageYPosition = 10; // メッセージの初期位置

    // メッセージを描画する関数
    let displayMessage = (message) => {
        let text = new PIXI.Text(message, textStyle);
        text.x = 20;
        text.y = messageYPosition;

        const textBounds = text.getLocalBounds();

        // 吹き出しの背景となる長方形を描画
        let background = new PIXI.Graphics();
        background.beginFill(0xB2D235); // 吹き出しの背景色（例：青）
        background.drawRoundedRect(text.x - 10, text.y - 5, textBounds.width + 20, textBounds.height + 10, 10); // 角を丸くした長方形
        background.endFill();

        app.stage.addChild(background);
        app.stage.addChild(text);

        messages.push(text, background);

        messageYPosition += textBounds.height + 20;

        // 吹き出しをクリックでアニメーション再生
        background.interactive = true;
        background.buttonMode = true;
        background.on('pointerdown', () => {
            const x = background.x + background.width / 2;
            const y = background.y + background.height / 2;
            const scaleFactor = background.width / 100; // 吹き出しの幅に合わせてアニメーションのサイズを調整
            playAnimation(x, y, scaleFactor);
        });
    }

    //ボタンクリックで生成
    document.getElementById('sendBtn').addEventListener('click', () => {
        let inputElement = document.getElementById('inputText');
        let inputText = inputElement.value.trim();

        if (inputText) {
            displayMessage(inputText); // メッセージをPixi.jsキャンバスに表示
            inputElement.value = ''; // 入力欄をクリア
        }
    });

    // キャンバスのリサイズに対応
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    // メッセージボックスをクリックしたら吹き出しのアニメーションを再生
    document.querySelectorAll('.message-box').forEach(box => {
        box.addEventListener('click', (e) => {
            const rect = e.target.getBoundingClientRect();
            const x = (rect.left + rect.right) / 2;
            const y = (rect.top + rect.bottom) / 2;
            playAnimation(x, y);
        });
    });

}
