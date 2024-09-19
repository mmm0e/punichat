const app = new PIXI.Application({ autoStart: false, resizeTo: window });
document.body.appendChild(app.view);

PIXI.Assets.load("texture.json").then((spritesheet) => {
    const textures = [];
    let i;

    for (i = 1; i < 86; i++) {
      // スプライトシート内のフレームキーを指定
        const framekey = `hukidashigreen (${i}).png`;

        // spritesheet.textures からテクスチャを取得
        const texture = spritesheet.textures[framekey];

        if (!texture) {
            console.error(`Texture not found: ${framekey}`);
            continue; // 見つからない場合はスキップ
        }

        // spritesheet.data.frames からフレームの duration を取得
        const frameData = spritesheet.data.frames[framekey];
        const time = frameData ? frameData.duration : 100; // デフォルト値を 100 に設定
        textures.push({ texture, time });
    }

    if (textures.length === 0) {
      console.error("No valid textures found for animation.");
      return;
    }

    const scaling = 1;

    // create a slow AnimatedSprite
    const slow = new PIXI.AnimatedSprite(textures.map(t => t.texture));

    slow.anchor.set(0.5);
    slow.scale.set(scaling);
    slow.animationSpeed = 0.5;
    slow.x = app.screen.width / 2;
    slow.y = app.screen.height / 2;
    slow.loop = false;
    slow.play();
    app.stage.addChild(slow);
    slow.gotoAndStop(0); // 初期状態は再生を停止

    // アニメーションに対してインタラクションを可能にする
    slow.interactive = true; // クリック可能にする
    slow.buttonMode = true; // カーソルがボタン風に変わる

    // クリックイベントを追加
    slow.on('pointerdown', () => {
        if (!slow.playing) {
            slow.play(); // クリックされたらアニメーションを再生
        }
    });

    // アニメーションが完了したら停止
    slow.onComplete = () => {
      slow.gotoAndStop(0); // 最初のフレームに戻す
    };

    // start animating
    app.start();
  });
