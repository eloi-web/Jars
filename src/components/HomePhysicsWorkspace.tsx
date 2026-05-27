import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

interface Props {
  onJarClick: () => void;
}

export const HomePhysicsWorkspace = ({ onJarClick }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  const widthRef = useRef(window.innerWidth);
  const heightRef = useRef(window.innerHeight);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = Matter.Engine.create();
    engineRef.current = engine;
    const world = engine.world;

    const render = Matter.Render.create({
      element: containerRef.current,
      engine: engine,
      options: {
        width: widthRef.current,
        height: heightRef.current,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
      }
    });
    renderRef.current = render;

    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    let boundaries: Matter.Body[] = [];
    const createBoundaries = () => {
      const w = widthRef.current;
      const h = heightRef.current;
      const t = 100;
      
      if (boundaries.length > 0) {
        Matter.Composite.remove(world, boundaries);
      }

      const ground = Matter.Bodies.rectangle(w / 2, h + t/2, w * 2, t, { isStatic: true, render: { visible: false } });
      const leftWall = Matter.Bodies.rectangle(-t/2, h / 2, t, h * 2, { isStatic: true, render: { visible: false } });
      const rightWall = Matter.Bodies.rectangle(w + t/2, h / 2, t, h * 2, { isStatic: true, render: { visible: false } });
      
      boundaries = [ground, leftWall, rightWall];
      Matter.Composite.add(world, boundaries);
    };
    createBoundaries();

    const checkResize = () => {
      if (widthRef.current !== window.innerWidth || heightRef.current !== window.innerHeight) {
        widthRef.current = window.innerWidth;
        heightRef.current = window.innerHeight;
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        createBoundaries();
      }
    };

    const resizeObserver = new ResizeObserver(checkResize);
    resizeObserver.observe(document.body);

    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.1,
        render: { visible: false }
      }
    });
    Matter.Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
      const bodies = Matter.Composite.allBodies(world);
      const clickedBodies = Matter.Query.point(bodies, event.mouse.position);
      // If a jar (which has the texture) is clicked
      if (clickedBodies.length > 0) {
        const hasJar = clickedBodies.some(b => b.render?.sprite?.texture);
        if (hasJar) {
          onJarClick();
        }
      }
    });

    const jarImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLsOQwV_Y13GK0aAL-lQo2WQjVthe5AmnlzLBQIW0UlPPr6uQtMWbNBJturS--CfNiNSkcWszuR9ThNS21RzeMIgVWxCkRAve7iOoEqLkTMnys5ZdlbkeEPK5XN04ahzUQrqnX72cEGchwvqzlDE-KXJnrqd7vRl7x7QY40g6oqvNRfDelK76yk7A5vJ-AXu-JsEIRH-4mqHKfDAZq6p7o-Bljeu9trHYp28Y_hxBBBZVQsknu4gbctLdGFeXZLCPdOO86FX9BV_Nd';
    const numJars = window.innerWidth > 768 ? 80 : 40;
    
    let timeoutIds: ReturnType<typeof setTimeout>[] = [];
    
    for (let i = 0; i < numJars; i++) {
      const tid = setTimeout(() => {
        const size = Math.random() * 40 + 40;
        const x = Math.random() * widthRef.current;
        const y = -100 - (Math.random() * 200);
        
        const jar = Matter.Bodies.rectangle(x, y, size * 0.7, size, {
          render: {
            sprite: {
              texture: jarImage,
              xScale: size / 500,
              yScale: size / 500
            }
          },
          restitution: 0.4,
          friction: 0.1,
          density: 0.05,
          angle: Math.random() * Math.PI * 2
        });
        Matter.Composite.add(world, jar);
      }, i * 50);
      timeoutIds.push(tid);
    }

    return () => {
      timeoutIds.forEach(clearTimeout);
      resizeObserver.disconnect();
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      if (engineRef.current) Matter.Engine.clear(engineRef.current);
      if (render.canvas) render.canvas.remove();
    };
  }, [onJarClick]);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-auto" />;
};
