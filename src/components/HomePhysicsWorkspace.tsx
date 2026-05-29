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

      if (boundaries.length > 0) Matter.Composite.remove(world, boundaries);

      const boundaryOptions = { isStatic: true, render: { visible: false, fillStyle: 'transparent', strokeStyle: 'transparent' } };

      const ground = Matter.Bodies.rectangle(w / 2, h + t / 2, w * 2, t, boundaryOptions);
      const leftWall = Matter.Bodies.rectangle(-t / 2, h / 2, t, h * 2, boundaryOptions);
      const rightWall = Matter.Bodies.rectangle(w + t / 2, h / 2, t, h * 2, boundaryOptions);
      const ceiling = Matter.Bodies.rectangle(w / 2, -t / 2 - 500, w * 2, t, boundaryOptions); // prevent them escaping upward intensely 

      boundaries = [ground, leftWall, rightWall, ceiling];
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
        stiffness: 0.2, // let them drag snappily
        render: { visible: false }
      }
    });
    Matter.Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    // Distinguish clicking vs dragging
    let startPoint = { x: 0, y: 0 };
    Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
      startPoint = { x: event.mouse.position.x, y: event.mouse.position.y };
    });

    Matter.Events.on(mouseConstraint, 'mouseup', (event) => {
      const endPoint = { x: event.mouse.position.x, y: event.mouse.position.y };
      const dist = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
      if (dist < 5) { // It's a clean click
        const bodies = Matter.Composite.allBodies(world);
        const clickedBodies = Matter.Query.point(bodies, event.mouse.position);
        if (clickedBodies.some(b => b.render?.sprite?.texture)) {
          onJarClick();
        }
      }
    });

    // Custom pointer cursor for jars
    Matter.Events.on(engine, 'afterUpdate', () => {
      const bodies = Matter.Composite.allBodies(world);
      const hovered = Matter.Query.point(bodies, mouse.position);
      const objHovered = hovered.some(b => b.render?.sprite?.texture);
      render.canvas.style.cursor = objHovered ? 'pointer' : 'default';
    });

    const jarImage = '/jar.png';
    const numJars = window.innerWidth > 768 ? 200 : 100;

    let timeoutIds: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < numJars; i++) {
      const tid = setTimeout(() => {
        const size = Math.random() * 110 + 40; // Sizes between 40 and 150
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
          friction: 0.2,
          density: 0.05,
          angle: Math.random() * Math.PI * 2
        });
        Matter.Composite.add(world, jar);
      }, i * 20); // Faster dropping
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
