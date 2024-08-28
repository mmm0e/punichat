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
let Matterballs2 = [];

window.onload = ()=>{
    // Pixi.js
    const app = new PIXI.Application({
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: 0x87CEEB
    });
    document.body.appendChild(app.view);

    //matter.js
	const engine = Engine.create();
    engine.world.gravity.y = 0;
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
            //enabled: false // Matter.jsのキャンバスを非表示にする
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
    const columns = 11; //〇の数（※奇数）
    const  rows = 2; //2で固定
    const  columnGap = 1;
    const  radius = 6;
    const  rowGap = 4 * 2 * radius + 3;
    const  xx = 40;
    let  yy = 40;

    let createSoftbody = (initialPositions, clientIdentifier, message) => { 
        console.log(`Softbody created by client: ${clientIdentifier}`);

        let Matterballs = [];
        let isStatic = clientIdentifier !== clientId; // 他クライアントのSoftbodyは動的

        let yyOffset = 30; // Y座標オフセットの増加量を10に設定
        if (Matterframe.length > 0) {
            let lastFrame = Matterframe[Matterframe.length - 1];
            yy = lastFrame.balls[columns].position.y + yyOffset; // 前のballsの10下に新しいballsを作成
        }
        yy += yyOffset; // 各ソフトボディ生成時にY座標をオフセット

        //frameの横の部分
        for(let i = 0; i < columns * 2; i++){
            let ball;
            if(i < columns){
                ball = Bodies.circle(xx + i * 2 * radius * columnGap, yy, radius, {
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
                    // 他のクライアントのボールは動的に設定
                    if (clientIdentifier !== clientId) {
                        ball.isStatic = true;
                    }
                }
                Composite.add(engine.world, ball);
                Matterballs.push(ball);
            } else {
                ball = Bodies.circle(xx + (i - columns) * 2 * radius * columnGap, yy + rowGap, radius, {
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
                    // 他のクライアントのボールは動的に設定
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

        Matterballs2 = [];
        const l = Matterballs[0].position.x;
        const m = Matterballs[0].position.y;
        const n = Matterballs[columns - 1].position.x;

        //frameの左縦の部分
        for(let j = 1; j < 4; j++){
            let ball2;
            ball2 = Bodies.circle(l, m + j * (2 * radius + 1), radius, {
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
                Body.setPosition(ball2, initialPositions[j]);
                // 他のクライアントのボールは動的に設定
                if (clientIdentifier !== clientId) {
                    ball2.isStatic = true;
                }
            }
            Composite.add(engine.world, ball2);
            Matterballs2.push(ball2);
            // クライアントの識別子を追加
            ball2.clientIdentifier = clientIdentifier;
        }
        //frameの右縦の部分
        for(let j = 1; j < 4; j++){
            let ball3 = Bodies.circle(n, m + j * (2 * radius + 1), radius, {
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
                Body.setPosition(ball3, initialPositions[j]);
                // 他のクライアントのボールは静的に設定
                if (clientIdentifier !== clientId) {
                    ball3.isStatic = true;
                }
            }
            Composite.add(engine.world, ball3);
            Matterballs2.push(ball3);
            // クライアントの識別子を追加
            ball3.clientIdentifier = clientIdentifier;
        }

        //大きな円の中に小さな円を配置
        const radius2 = 7;
        const x = Matterballs[1].position.x;
        const y = Matterballs[1].position.y + radius;

        //Matter.Composites.softBody で新しいソフトボディを作成
        const softBody = Composites.softBody(
            x, y,
            7, 3, // columns, rows
            0, 0, // columnGap, rowGap
            false, // crossBrace
            radius2, // particleRadius
            {collisionFilter: {
                    category: lquidCategory
                }
            },
            {
                stiffness: 0.9,
                render: { visible: false }
            }
        );

        // ソフトボディのボールを追加
        softBody.bodies.forEach(ball => {
            Matterbeads.push(ball);
        });
        Composite.add(engine.world, softBody);

        // ここで生成位置でアンカーとしてsoftbodyを固定
        const anchorConstraints = [
            Constraint.create({
                bodyA: softBody.bodies[0],
                pointA: { x: 0, y: 0 },
                pointB: { x: softBody.bodies[0].position.x, y: softBody.bodies[0].position.y },
                stiffness: 0.9
            }),
            Constraint.create({
                bodyA: softBody.bodies[softBody.bodies.length - 1],
                pointA: { x: 0, y: 0 },
                pointB: { x: softBody.bodies[softBody.bodies.length - 1].position.x, y: softBody.bodies[softBody.bodies.length - 1].position.y },
                stiffness: 0.9
            })
        ];
        Composite.add(engine.world, anchorConstraints);

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

        for(let b = columns + 1; b < columns * rows; b++) {
            const chainConstraint2 = Constraint.create({
                bodyA: Matterballs[b - 1],
                pointA: { x: radius, y: 0 },
                bodyB: Matterballs[b],
                pointB: { x: -radius, y: 0 },
                stiffness: 0.9,
                length: 1
            })
            Composite.add(engine.world, [chainConstraint2]);
        }

        for(let a = 1; a < 3; a++) {
            const chainConstraint3 = Constraint.create({
                bodyA: Matterballs2[a - 1],
                pointA: { x: 0, y: radius },
                bodyB: Matterballs2[a],
                pointB: { x: 0, y: -radius },
                stiffness: 0.9,
                length: 1
            })
            Composite.add(engine.world, [chainConstraint3]);
        }
    
        for(let a = 4; a < 6; a++) {
            const chainConstraint4 = Constraint.create({
                bodyA: Matterballs2[a - 1],
                pointA: { x: 0, y: radius },
                bodyB: Matterballs2[a],
                pointB: { x: 0, y: -radius },
                stiffness: 0.9,
                length: 1
            })
            Composite.add(engine.world, [chainConstraint4]);
        }

        const Constraint1 = Constraint.create({
            bodyA: Matterballs[0],
            pointA: { x: 0, y: radius },
            bodyB: Matterballs2[0],
            pointB: { x: 0, y: -radius },
            stiffness: 0.9,
            length: 1
        })
        Composite.add(engine.world, [Constraint1]);

        const Constraint2 = Constraint.create({
            bodyA: Matterballs[columns - 1],
            pointA: { x: 0, y: radius },
            bodyB: Matterballs2[3],
            pointB: { x: 0, y: -radius },
            stiffness: 0.9,
            length: 1
        })
        Composite.add(engine.world, [Constraint2]);

        const Constraint3 = Constraint.create({
            bodyA: Matterballs[2*columns-1],
            pointA: { x: 0, y: -radius },
            bodyB: Matterballs2[5],
            pointB: { x: 0, y: radius },
            stiffness: 0.9,
            length: 1
        })
        Composite.add(engine.world, [Constraint3]);

        const Constraint4 = Constraint.create({
            bodyA: Matterballs[columns],
            pointA: { x: 0, y: -radius },
            bodyB: Matterballs2[2],
            pointB: { x: 0, y: radius },
            stiffness: 0.9,
            length: 1
        })
        Composite.add(engine.world, [Constraint4]);

        // グラフィックスオブジェクトを作成し、Pixiのステージに追加
        let graphics = new PIXI.Graphics();
        app.stage.addChild(graphics);

        let text = null;
        if (message) {
            let center = getSoftBodyCenter(softBody); // ソフトボディの中心を計算
            text = new PIXI.Text(message, textStyle);
            text.anchor.set(0.5); // テキストの中心をアンカーに設定
            text.x = center.x; // ソフトボディの中心にテキストを配置
            text.y = center.y;
            app.stage.addChild(text);
        }

        Matterframe.push({ balls: Matterballs, balls2: Matterballs2, beads: Matterbeads, graphics: graphics, text: text });

        // 生成されたソフトボディ情報を他のクライアントに送信
        if (clientIdentifier === clientId) {
            socket.emit('createSoftbody', {
                clientId: clientId,
                message: message,
                initialPositions: Matterballs.map(b => ({ x: b.position.x, y: b.position.y })),
                initialPositions2: Matterballs2.map(b => ({ x: b.position.x, y: b.position.y })),
                beadPositions: Matterbeads.map(b => ({ x: b.position.x, y: b.position.y }))
            });
        }

    };

    let getSoftBodyCenter = (softBody) => {
        let totalX = 0;
        let totalY = 0;
        softBody.bodies.forEach(body => {
            totalX += body.position.x;
            totalY += body.position.y;
        });
        return {
            x: totalX / softBody.bodies.length,
            y: totalY / softBody.bodies.length
        };
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
                    let balls2 = frame.balls2;

                    if (balls.length > 0) {
                        g.lineStyle(2, 0xffffff); 
                        g.moveTo(balls[0].position.x, balls[0].position.y);
                        for (let i = 1; i < columns; i++) {
                            g.lineTo(balls[i].position.x, balls[i].position.y);
                        }

                        g.lineTo(balls2[3].position.x, balls2[3].position.y);
                        g.lineTo(balls2[4].position.x, balls2[4].position.y);
                        g.lineTo(balls2[5].position.x, balls2[5].position.y);
                        g.lineTo(balls[2*columns - 1].position.x, balls[2*columns - 1].position.y);

                        for (let j = 2*columns - 2; j >= columns; j--) {
                            g.lineTo(balls[j].position.x, balls[j].position.y);
                        }

                        g.lineTo(balls2[2].position.x, balls2[2].position.y);
                        g.lineTo(balls2[1].position.x, balls2[1].position.y);
                        g.lineTo(balls2[0].position.x, balls2[0].position.y);
                        g.lineTo(balls[0].position.x, balls[0].position.y); 
                    }
                    g.endFill();
                }
                 // テキストの位置を更新
                if (frame.text && frame.balls.length > 0) {
                    let center = getSoftBodyCenter(frame.beads);
                    frame.text.x = center.x;
                    frame.text.y = center.y; // テキストをSoftbodyの中心に表示
                }
            });
        }

        const ballsData = {
            clientId: clientId,
            Matterballs: Matterframe.map(frame => frame.balls.map(b => ({
                x: b.position.x,
                y: b.position.y,
                clientIdentifier: b.clientIdentifier
            }))),
            Matterballs2: Matterframe.map(frame => frame.balls2.map(b => ({
                x: b.position.x,
                y: b.position.y,
                clientIdentifier: b.clientIdentifier
            }))),
            Matterbeads: Matterframe.map(frame => frame.beads.map(b => ({
                x: b.position.x,
                y: b.position.y,
                clientIdentifier: b.clientIdentifier
            }))),
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
        displayMessage(data.message, data.position);
        createSoftbody(null, data.clientId, data.message);
    });

    //softbody
    // 他のクライアントがballsを生成したことを受信
    socket.on('createSoftbody', (data) => {
        // 生成されたボールが相手の画面で生成されたものであることを示すフラグを使用してボールを生成
        //createSoftbody(null, data.clientId, data.message); 

        // 他のクライアントの情報を使ってソフトボディを生成
        if (data.clientId !== clientId) {
            createSoftbody(data.initialPositions, data.clientId, data.message);
        }
    });

    socket.on('ballsupdate', (ballsData) => {
        if (ballsData && ballsData.Matterballs && ballsData.Matterballs2 && ballsData.Matterbeads) {
            // Matterballsの更新
            for (let i = 0; i < Matterframe.length; i++) {
                let frame = Matterframe[i];
                let remoteBalls = ballsData.Matterballs[i];
                let remoteBalls2 = ballsData.Matterballs2[i];
                let remoteBeads = ballsData.Matterbeads[i];
    
                if (remoteBalls && remoteBalls2 && remoteBeads) { // remoteBallsが存在するかチェック
                    frame.balls.forEach((p, index) => {
                        let remoteBall = remoteBalls[index];
                        // if (remoteBall) {
                        //     Body.setPosition(p, { x: remoteBall.x, y: remoteBall.y });
                        //     if (p.clientIdentifier !== clientId) {
                        //         p.isStatic = true; // 他クライアントのボールは静的に設定
                        //     } else {
                        //         p.isStatic = false; // 自分のクライアントのボールは動的に設定
                        //     }
                        if (remoteBall && p.clientIdentifier !== clientId) {
                            Body.setPosition(p, { x: remoteBall.x, y: remoteBall.y });
                        }
                    });
                    frame.balls2.forEach((p, index) => {
                        let remoteBall2 = remoteBalls2[index];
                        if (remoteBall2 && p.clientIdentifier !== clientId) {
                            Body.setPosition(p, { x: remoteBall2.x, y: remoteBall2.y });
                        }
                    });
                    // frame.beads.forEach((p, index) => {
                    //     let remoteBeads = remoteBeads[index];
                    //     if (remoteBeads && p.clientIdentifier !== clientId) {
                    //         Body.setPosition(p, { x: remoteBeads.x, y: remoteBeads.y });
                    //     }
                    // });
                }
            }

            // Matterbeadsの更新
            // for (let i = 0; i < Matterbeads.length; i++) {
            //     let remoteBead = ballsData.Matterbeads[i];
            //     if (remoteBead && Matterbeads[i].clientIdentifier !== clientId) {
            //         Body.setPosition(Matterbeads[i], { x: remoteBead.x, y: remoteBead.y });
            //     }
            // }
            // // Matterballs2の更新
            // for (let i = 0; i < Matterballs2.length; i++) {
            //     let remoteBall2 = ballsData.Matterballs2[i];
            //     if (remoteBall2 && Matterballs2[i].clientIdentifier !== clientId) {
            //         Body.setPosition(Matterballs2[i], { x: remoteBall2.x, y: remoteBall2.y });
            //     }
            // }

            // //Matterbeadsの更新
            // for (let i = 0; i < Matterbeads.length; i++) {
            //     if (ballsData.Matterbeads[i]) { // ballsData.Matterbeads[i]が存在するかチェック
            //         Body.setPosition(Matterbeads[i], { x: ballsData.Matterbeads[i].x, y: ballsData.Matterbeads[i].y });
            //         if (Matterbeads[i].clientIdentifier !== clientId) {
            //             Matterbeads[i].isStatic = true; // 常に静的
            //         } else {
            //             Matterbeads[i].isStatic = false;
            //         }
            //     }
            // }
            // // Matterballs2の更新
            // for (let i = 0; i < Matterballs2.length; i++) {
            //     if (ballsData.Matterballs2[i]) { // ballsData.Matterballs2[i]が存在するかチェック
            //         Body.setPosition(Matterballs2[i], { x: ballsData.Matterballs2[i].x, y: ballsData.Matterballs2[i].y });
            //         if (Matterballs2[i].clientIdentifier !== clientId) {
            //             Matterballs2[i].isStatic = true; // 他クライアントのボールは静的に設定
            //         } else {
            //             Matterballs2[i].isStatic = false; // 自分のクライアントのボールは動的に設定
            //         }
            //     }
            // }
        } else {
            console.error('Invalid ballsData received:', ballsData);
        }
    });
}