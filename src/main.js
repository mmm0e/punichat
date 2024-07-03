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
    const columns = 13; //〇の数（※奇数）
    const  rows = 2; //2で固定
    const  columnGap = 2;
    const  rowGap = 20;
    const  radius = 6;
    const  xx = 60;
    let  yy = 100;
    let yyOffset = 0; // Y座標オフセット

    let createSoftbody = (initialPositions, clientIdentifier, message) => { 
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
                    // 他のクライアントのボールは静的に設定
                    if (clientIdentifier !== clientId) {
                        ball.isStatic = true;
                    }
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
                    // 他のクライアントのボールは静的に設定
                    if (clientIdentifier !== clientId) {
                        ball.isStatic = true;
                    }
                }
                Composite.add(engine.world, ball);
                Matterballs.push(ball);
            }
            // クライアントの識別子を追加
            ball.clientIdentifier = clientIdentifier;
        }

        // グラフィックスオブジェクトを作成し、Pixiのステージに追加
        let graphics = new PIXI.Graphics();
        app.stage.addChild(graphics);

        // メッセージがあればテキストオブジェクトを作成し、最初のボールに付随させる
        let text = null;
        if (message) {
            text = new PIXI.Text(message, textStyle);
            app.stage.addChild(text);
        }
        Matterframe.push({ balls: Matterballs, graphics: graphics , text: text});

        yyOffset += 10; // 次のソフトボディ生成時にY座標を下にずらす

        //大きな円の中に小さな円を配置
        const num = 20;
        const radius2 = 10;
        const x = Matterballs[1].position.x;
        const y = (Matterballs[0].position.y + Matterballs[columns].position.y) / 2;

        let bead1 = Bodies.circle(x, y, radius2, {
            restitution: 0,
            friction: 0.00001,
            density: 0.01,
            frictionAir: 0.0011,
            collisionFilter: {
                category: lquidCategory
            },
            isStatic: isStatic
        });

        let bead2 = Bodies.circle(x + radius2, y - radius2, radius2, {
            restitution: 0,
            friction: 0.00001,
            density: 0.01,
            frictionAir: 0.0011,
            collisionFilter: {
                category: lquidCategory
            },
            isStatic: isStatic
        });

        let bead3 = Bodies.circle(x + 2*radius2, y, radius2, {
            restitution: 0,
            friction: 0.00001,
            density: 0.01,
            frictionAir: 0.0011,
            collisionFilter: {
                category: lquidCategory
            },
            isStatic: isStatic
        });

        let bead4 = Bodies.circle(x + radius2, y + radius2, radius2, {
            restitution: 0,
            friction: 0.00001,
            density: 0.01,
            frictionAir: 0.0011,
            collisionFilter: {
                category: lquidCategory
            },
            isStatic: isStatic
        });

        Matterbeads.push(bead1,bead2,bead3,bead4);
        Composite.add(engine.world, bead1, bead2, bead3, bead4);

        const Constraint1 = Constraint.create({
            bodyA: bead1,
            pointA: { x: radius2, y: 0 },
            bodyB: bead2,
            pointB: { x: -radius2, y: 0 },
            stiffness: 0.9,
            length: 1
        })
        Composite.add(engine.world, [Constraint1]);

        const Constraint2 = Constraint.create({
            bodyA: bead2,
            pointA: { x: radius2, y: 0 },
            bodyB: bead3,
            pointB: { x: -radius2, y: 0 },
            stiffness: 0.9,
            length: 1
        })
        Composite.add(engine.world, [Constraint2]);



        // Matter.Composites.softBody で新しいソフトボディを作成
        // const softBody = Composites.softBody(
        //     x, y,
        //     8, 3, // columns, rows
        //     0, 0, // columnGap, rowGap
        //     false, // crossBrace
        //     radius2, // particleRadius
        //     {collisionFilter: {
        //             category: lquidCategory
        //         }
        //     },
        //     {
        //         stiffness: 0.9,
        //         render: { visible: false }
        //     }
        // );
        // // ソフトボディのボールを追加
        // softBody.bodies.forEach(ball => {
        //     Matterbeads.push(ball);
        // });
        // Composite.add(engine.world, softBody);

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
        
        // for (let i = 0; i < num; i++) {
        //     const bead = Bodies.circle(x, y, radius2, {
        //         collisionFilter: {
        //             category: lquidCategory
        //         },
        //     });   
        //     Composite.add(engine.world, bead);
        //     Matterbeads.push(bead);
        // }
    };

    Events.on(engine, 'afterUpdate', () => {
        // pixi.js
        if (Matterframe.length > 0) {
            Matterframe.forEach(frame => {
                if (frame.graphics) { 
                    let g = frame.graphics;
                    g.clear(); 
                    g.beginFill(0xffffff);
                    let balls = frame.balls;
    
                    if (balls.length > 0) {
                        g.lineStyle(2, 0xffffff); 
                        g.moveTo(balls[0].position.x, balls[0].position.y);

                        for (let i = 1; i < columns; i++) {
                            g.lineTo(balls[i].position.x, balls[i].position.y);
                        }
                        g.lineTo(balls[2*columns - 1].position.x, balls[2*columns - 1].position.y);
                        for (let j = 2*columns - 2; j >= columns; j--) {
                            g.lineTo(balls[j].position.x, balls[j].position.y);
                        }
                        g.lineTo(balls[0].position.x, balls[0].position.y); 
                    }
                    g.endFill();
                }
                // テキストの位置を更新
                if (frame.text && frame.balls.length > 0) {
                    let ball = frame.balls[0];
                    frame.text.x = ball.position.x;
                    frame.text.y = ball.position.y - 20; // テキストがボールの上に表示されるようにオフセット
                }
            });
        }

        // pixi.js
        // サーバーに現在のballsの座標を送信
        const ballsData = {
            clientId: clientId,
            Matterballs: Matterframe.map(frame => frame.balls.map(ball => ({ x: ball.position.x, y: ball.position.y }))),
            Matterbeads: Matterbeads.map(bead => ({ x: bead.position.x, y: bead.position.y }))
        };
        socket.emit('ballsmove', ballsData);
    });
    
    // テキスト
    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 'black'
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
        // createSoftbody(null, clientId);
        // //生成されたボールが自分の画面で生成されたものであることを示すフラグを送信
        // socket.emit('createSoftbody', clientId);

        let inputText = document.getElementById('inputText').value;
        createSoftbody(null, clientId, inputText);
        socket.emit('createSoftbody', { clientId: clientId, message: inputText });
        document.getElementById('inputText').value = ''; // 入力フィールドをクリア
    });

    //text
    socket.on('newMessage', (data) => {
        //displayMessage(data.message, data.position);
        createSoftbody(null, data.clientId, data.message);
    });

    //softbody
    // 他のクライアントがballsを生成したことを受信
    socket.on('createSoftbody', (data) => {
        // 生成されたボールが相手の画面で生成されたものであることを示すフラグを使用してボールを生成
        createSoftbody(null, data.clientId, data.message); 
    });

    socket.on('ballsupdate', (ballsData) => {
        if (ballsData && ballsData.Matterballs && ballsData.Matterbeads) {
            // Matterballsの更新
            for (let i = 0; i < Matterframe.length; i++) {
                let frame = Matterframe[i];
                let remoteBalls = ballsData.Matterballs[i];
    
                if (remoteBalls) { // remoteBallsが存在するかチェック
                    frame.balls.forEach((p, index) => {
                        let remoteBall = remoteBalls[index];
                        if (remoteBall) {
                            Body.setPosition(p, { x: remoteBall.x, y: remoteBall.y });
                            if (p.clientIdentifier !== clientId) {
                                p.isStatic = true; // 他クライアントのボールは静的に設定
                            } else {
                                p.isStatic = false; // 自分のクライアントのボールは動的に設定
                            }
                        }
                    });
                }
            }
            //Matterbeadsの更新
            for (let i = 0; i < Matterbeads.length; i++) {
                if (ballsData.Matterbeads[i]) { // ballsData.Matterbeads[i]が存在するかチェック
                    Body.setPosition(Matterbeads[i], { x: ballsData.Matterbeads[i].x, y: ballsData.Matterbeads[i].y });
                }
            }
        } else {
            console.error('Invalid ballsData received:', ballsData);
        }
    });

    // socket.on('ballsupdate', (ballsData) => {
    //     if (ballsData && ballsData.Matterballs && ballsData.Matterbeads) {
    //         // Matterballsの更新
    //         for (let i = 0; i < Matterframe.length; i++) {
    //             if (ballsData.Matterballs[i]) { // ballsData.Matterballs[i]が存在するかチェック
    //                 Matterframe[i].forEach((p, index) => {
    //                     if (p.clientIdentifier !== clientId && ballsData.Matterballs[i][index]) { // ballsData.Matterballs[i][index]が存在するかチェック
    //                         Body.setPosition(p, { x: ballsData.Matterballs[i][index].x, y: ballsData.Matterballs[i][index].y });
    //                         p.isStatic = true;
    //                     }
    //                 });
    //             }
    //         }
    //         // Matterbeadsの更新
    //         for (let i = 0; i < Matterbeads.length; i++) {
    //             if (ballsData.Matterbeads[i]) { // ballsData.Matterbeads[i]が存在するかチェック
    //                 Body.setPosition(Matterbeads[i], { x: ballsData.Matterbeads[i].x, y: ballsData.Matterbeads[i].y });
    //             }
    //         }
    //     } else {
    //         console.error('Invalid ballsData received:', ballsData);
    //     }
    // });

}