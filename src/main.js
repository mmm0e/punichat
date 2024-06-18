"use strict";

const WIDTH  = 220;
const HEIGHT = 600;

// モジュール各種
const Engine     = Matter.Engine;
const Render     = Matter.Render;
const Runner     = Matter.Runner;
const Body       = Matter.Body;
const Bodies     = Matter.Bodies;
const Bounds     = Matter.Bounds;
const Common     = Matter.Common;
const Composite  = Matter.Composite;
const Composites = Matter.Composites;
const Constraint = Matter.Constraint;
const Events     = Matter.Events;
const Mouse      = Matter.Mouse;
const MouseConstraint = Matter.MouseConstraint;

const socket = io();

// a-z のランダムな文字
let clientId = String.fromCharCode(97 + Math.floor(Math.random() * 26)); 

socket.on('connect', () => {
    socket.emit('registerClient', clientId);
});

let Matterbeads = [];
let Matterframe = [];
let messages = []; // メッセージのリスト

window.onload = ()=>{
    // Pixi.js
    const app = new PIXI.Application({width: WIDTH, height: HEIGHT});
    document.body.appendChild(app.view);
    let g;

    //matter.js
	const engine = Engine.create();
    engine.world.gravity.y = -0.1;
	const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: WIDTH, height: HEIGHT,
            showAngleIndicator: true,
            showCollisions: true,
            showDebug: false,
            showIds: false,
            showVelocity: true,
            hasBounds: true,
            wireframes: true// Important!!
        }
	});
	Render.run(render);

	const runner = Runner.create();
	Runner.run(runner, engine);

    //　壁
    const wallR = Bodies.rectangle(WIDTH, HEIGHT/2, 50, HEIGHT,{isStatic: true});
    const wallL = Bodies.rectangle(0, HEIGHT/2, 50, HEIGHT,{isStatic: true});
    const ceiling = Bodies.rectangle(WIDTH/2, 0, WIDTH, 50,{isStatic: true});
    Composite.add(engine.world, [ceiling, wallR, wallL]);

    // マウスの設定
    const mouse = Mouse.create(render.canvas);
    render.mouse = mouse;
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {visible: false}
        }
    });
    Composite.add(engine.world, mouseConstraint);

    // add bodies
    const lquidCategory = 0x0004;
    const columns = 7; //〇の数（※奇数）
    const  rows = 2; //2で固定
    const  columnGap = 1;
    const  rowGap = 2;
    const  radius = 10;
    const  xx = 60;
    let  yy = HEIGHT/2 - 100;
    let yyOffset = 0; // Y座標オフセット

    let createSoftbody = (initialPositions, clientIdentifier) => { 
        console.log(`Softbody created by client: ${clientIdentifier}`);

        let Matterballs = [];
        let isStatic = clientIdentifier !== clientId; // 他クライアントのSoftbodyは静的

        yy += yyOffset; // 各ソフトボディ生成時にY座標をオフセット

        for(let i = 0; i < columns * 2; i++){
            let ball;
            if(i < columns){
                ball = Bodies.circle(xx + i * columnGap, yy, radius, {
                    restitution: 0,
                    friction: 0.00001,
                    density: 0.01,
                    frictionAir: 0.0011,
                    collisionFilter: {
                        category: lquidCategory
                    },
                    isStatic: isStatic
                });
                if (initialPositions) {
                    Body.setPosition(ball, initialPositions[i]);
                }
                Composite.add(engine.world, ball);
                Matterballs.push(ball);
            } else {
                ball = Bodies.circle(xx + (i - columns) * columnGap, yy + rowGap, radius, {
                    restitution: 0,
                    friction: 0.00001,
                    density: 0.01,
                    frictionAir: 0.0011,
                    collisionFilter: {
                        category: lquidCategory
                    },
                    isStatic: isStatic
                });
                if (initialPositions) {
                    Body.setPosition(ball, initialPositions[i]);
                }
                Composite.add(engine.world, ball);
                Matterballs.push(ball);
            }
            // クライアントの識別子を追加
            ball.clientIdentifier = clientIdentifier;
        }
        Matterframe.push(Matterballs);

        // グラフィックスオブジェクトを作成し、Pixiのステージに追加
        // let graphics = new PIXI.Graphics();
        // app.stage.addChild(graphics);
        // Matterframe.push({ balls: Matterballs, graphics: graphics });

        yyOffset += 10; // 次のソフトボディ生成時にY座標を下にずらす

        //〇を接続
        for(let a = 1; a < columns; a++) {
            const chainConstraint1 = Constraint.create({
                bodyA: Matterballs[a - 1],
                pointA: { x: radius, y: 0 },
                bodyB: Matterballs[a],
                pointB: { x: -radius, y: 0 },
                stiffness: 0.9,
                length: 1
            })
            Composite.add(engine.world, [chainConstraint1]);
        }
        const chainConstraint2 = Constraint.create({
            bodyA: Matterballs[columns - 1],
            pointA: { x: radius, y: 0 },
            bodyB: Matterballs[columns*rows - 1],
            pointB: { x: radius, y: 0 },
            stiffness: 0.9,
            length: 1
        })
        Composite.add(engine.world, [chainConstraint2]);
        for(let b = columns + 1; b < columns * rows; b++) {
            const chainConstraint3 = Constraint.create({
                bodyA: Matterballs[b - 1],
                pointA: { x: radius, y: 0 },
                bodyB: Matterballs[b],
                pointB: { x: -radius, y: 0 },
                stiffness: 0.9,
                length: 1
            })
            Composite.add(engine.world, [chainConstraint3]);
        }
        const chainConstraint4 = Constraint.create({
            bodyA: Matterballs[0],
            pointA: { x: -radius, y: 0 },
            bodyB: Matterballs[columns],
            pointB: { x: -radius, y: 0 },
            stiffness: 0.9,
            length: 1
        })
        Composite.add(engine.world, [chainConstraint4]);
        
        //大きな円の中に小さな円を配置
        const num = 13;
        const radius2 = 8;
        const x = Matterballs[(columns - 1) / 2].position.x;
        const y = (Matterballs[0].position.y + Matterballs[columns].position.y) / 2;

        for (let i = 0; i < num; i++) {
            const bead = Bodies.circle(x, y, radius2, {
                collisionFilter: {
                    category: lquidCategory
                },
            });   
            Composite.add(engine.world, bead);
            Matterbeads.push(bead);

            // beadsをチェーンで繋ぐ処理
            // if (i > 0) { // 最初のbeadは飛ばす
            //     const chainConstraint_b = Constraint.create({
            //         bodyA: Matterbeads[i - 1],
            //         pointA: { x: radius2, y: 0 },
            //         bodyB: bead,
            //         pointB: { x: -radius2, y: 0 },
            //         stiffness: 0.9,
            //         length: 1
            //     });
            //     Composite.add(engine.world, chainConstraint_b);
            // }
        }
    }
    
    Events.on(engine, 'afterUpdate', () => {
        // pixi.js
        if(!g) {
            // 繰り返し描画が呼ばれるので、Graphicsは初回に一度だけ作って使い回す
            g = new PIXI.Graphics(); 
            app.stage.addChild(g);
        }
        g.clear(); 
        g.beginFill(0xffffff);

        if (Matterframe.length > 0) {
            let firstFrame = Matterframe[0]; // 最初のボール
            g.lineStyle(2, 0xffffff); // 輪っかの線のスタイルを設定

            // 楕円の描画を開始
            g.moveTo(firstFrame[0].position.x, firstFrame[0].position.y);
            for (let i = 1; i < columns; i++) {
                g.lineTo(firstFrame[i].position.x, firstFrame[i].position.y);
            }
            g.lineTo(firstFrame[2*columns - 1].position.x, firstFrame[2*columns - 1].position.y);
            for (let j = 2*columns - 2; j >= columns; j--) {
                g.lineTo(firstFrame[j].position.x, firstFrame[j].position.y);
            } 
            g.lineTo(firstFrame[0].position.x, firstFrame[0].position.y); 
        }
        g.endFill();
    
        // サーバーに現在のballsの座標を送信
        const ballsData = {
            clientId: clientId,
            Matterballs: Matterframe.map(frame => frame.filter(ball => ball.clientIdentifier === clientId).map(ball => ({ x: ball.position.x, y: ball.position.y }))),
            Matterbeads: Matterbeads.map(bead => ({ x: bead.position.x, y: bead.position.y }))
        };
        socket.emit('ballsmove', ballsData);
    });

    // Pixi.jsテキストスタイル
    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 'white'
    });

    // メッセージを描画する関数
    let displayMessage = (message, position) => {
        let text = new PIXI.Text(message, textStyle);
        text.x = position.x; // ソフトボディの位置に合わせる
        text.y = position.y;
        app.stage.addChild(text);
        messages.push(text);
    }

    //ボタンクリックで生成
    document.getElementById('sendButton').addEventListener('click', () => {
        createSoftbody(null, clientId);
        //生成されたボールが自分の画面で生成されたものであることを示すフラグを送信
        socket.emit('createSoftbody', clientId);

        let inputText = document.getElementById('inputText').value;
        if (inputText) {
            let lastBall = Matterframe[Matterframe.length - 1][0]; // 最後に生成されたソフトボディの最初のボールの位置を取得
            let position = { x: lastBall.position.x, y: lastBall.position.y };
            displayMessage(inputText, position);
            socket.emit('newMessage', { message: inputText, position: position });
            document.getElementById('inputText').value = ''; // 入力フィールドをクリア
        }

    });

    //text
    socket.on('newMessage', (data) => {
        displayMessage(data.message, data.position);
    });

    //softbody
    socket.on('ballsupdate', (ballsData) => {
        if (ballsData && ballsData.Matterballs && ballsData.Matterbeads) {
            // Matterballsの更新
            for (let i = 0; i < Matterframe.length; i++) {
                if (ballsData.Matterballs[i]) { // ballsData.Matterballs[i]が存在するかチェック
                    Matterframe[i].forEach((p, index) => {
                        if (p.clientIdentifier !== clientId && ballsData.Matterballs[i][index]) { // ballsData.Matterballs[i][index]が存在するかチェック
                            Body.setPosition(p, { x: ballsData.Matterballs[i][index].x, y: ballsData.Matterballs[i][index].y });
                            p.isStatic = true;
                        }
                    });
                }
            }
            // Matterbeadsの更新
            for (let i = 0; i < Matterbeads.length; i++) {
                if (ballsData.Matterbeads[i]) { // ballsData.Matterbeads[i]が存在するかチェック
                    Body.setPosition(Matterbeads[i], { x: ballsData.Matterbeads[i].x, y: ballsData.Matterbeads[i].y });
                }
            }
        } else {
            console.error('Invalid ballsData received:', ballsData);
        }
    });

    // 他のクライアントがballsを生成したことを受信
    socket.on('createSoftbody', (remoteClientId) => {
        // 生成されたボールが相手の画面で生成されたものであることを示すフラグを使用してボールを生成
        createSoftbody(null, remoteClientId); 
    });
  
}