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

let Matterballs = [];
let Matterbeads = [];
let Pixiballs = [];
let Pixibeads = [];

window.onload = ()=>{

    // Pixi.js
    const app = new PIXI.Application({width: WIDTH, height: HEIGHT});
    let g = new PIXI.Graphics();
    document.body.appendChild(app.view);
    app.stage.addChild(g);

    // let drawballs = (points, r) => {
    //     if(!g) {
    //         // 繰り返し描画が呼ばれるので、Graphicsは初回に一度だけ作って使い回す
    //         g = new PIXI.Graphics(); 
    //         app.stage.addChild(g);
    //     }
    //     g.clear(); // 前回の描画をクリア
    //     g.beginFill(0xffffff);
    //     points.forEach(p => {
    //         g.drawCircle(p.x, p.y, r);
    //     });
    //     g.endFill();
    // }

    //matter.js
	// 物理エンジン本体のクラス
	const engine = Engine.create();
    engine.world.gravity.y = -0.1;

    // 画面を描画するクラス
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

    // 物理世界を更新します
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
    const columns = 7, //〇の数（※奇数）
          rows = 2, //2で固定
          columnGap = 1,
          rowGap = 2,
          radius = 10,
          xx = WIDTH/2 - radius*columns,
          yy = HEIGHT/2;

    let createSoftbody = () => {

        // const balls = Composites.stack(xx, yy, columns, rows, columnGap, rowGap,(x, y) => { 
        //     return Bodies.circle(x, y, radius, {
        //     restitution: 0,
        //     friction: 0.00001,
        //     density: 0.01,
        //     frictionAir: 0.0011,
        //     collisionFilter: {
        //         category: lquidCategory
        //     },
        //     });
        // });
        // Composite.add(engine.world, balls);

        for(let i = 0; i < columns; i++){
            let balls = [];
            const ball = Bodies.circle(xx + i * columnGap, yy, radius, {
                restitution: 0,
                friction: 0.00001,
                density: 0.01,
                frictionAir: 0.0011,
                collisionFilter: {
                    category: lquidCategory
                },
            });
            Composite.add(engine.world, ball);
            balls.push(ball);
            //Pixiballs.push(new PIXI.Graphics().drawCircle(xx + i * columnGap, yy, radius));
        }
        

        //2段目
        let n = 0;
        for(let j = columns; j < 2 * columns; j++){
            const ball = Bodies.circle(xx + n * columnGap, yy + rowGap, radius, {
                restitution: 0,
                friction: 0.00001,
                density: 0.01,
                frictionAir: 0.0011,
                collisionFilter: {
                    category: lquidCategory
                },
            });
            Composite.add(engine.world, ball);
            Matterballs.push(ball);
            Pixiballs.push(new PIXI.Graphics().drawCircle(xx + n * columnGap, yy + rowGap, radius));
            n++;
        }

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
            Pixibeads.push(g.drawCircle(x, y, radius2));
        }

        // エンジンをUpdateした後の処理を書く
        // 動いたmatterの座標を取り出す内容
        Events.on(engine, 'afterUpdate',() => {
            if(!g) {
                // 繰り返し描画が呼ばれるので、Graphicsは初回に一度だけ作って使い回す
                g = new PIXI.Graphics(); 
                app.stage.addChild(g);
            }
            for(let i = 0; i < Matterballs.length; i++){
                let MatterObj = Matterballs[i];
                let PixiObj = Pixiballs[i];
                PixiObj.clear(); // 前回の描画をクリア
                PixiObj.beginFill(0xffffff);
                PixiObj.drawCircle(MatterObj.position.x, MatterObj.position.y, radius);
                PixiObj.endFill();
            }
            for(let i = 0; i < Matterbeads.length; i++){
                let MatterObj = Matterbeads[i];
                let PixiObj = Pixibeads[i];
                PixiObj.clear(); // 前回の描画をクリア
                PixiObj.beginFill(0xffffff);
                PixiObj.drawCircle(MatterObj.position.x, MatterObj.position.y, radius2);
                PixiObj.endFill();
            }
        });

        // Events.on(engine, 'afterUpdate',() => {
            // const ballspoints = balls.bodies.map(b => b.position);
            // const beadspoints = Arraybeads.map(p => p.position);
            // drawballs(ballspoints, radius);
            // drawballs(Arraybeads, radius2);
        // });
    }

    //　クリックしたらでてくるよ
    document.getElementById('sendButton').addEventListener('click', () => {
        createSoftbody();
    });

}