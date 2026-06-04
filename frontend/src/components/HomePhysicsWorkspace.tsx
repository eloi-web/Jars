import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { JarData } from '../App';

interface Props {
  jars: JarData[];
  onSelectJar: (jar: JarData) => void;
  goldJarId?: string | null;
}

export const HomePhysicsWorkspace = ({ jars, onSelectJar, goldJarId }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  const widthRef = useRef(window.innerWidth);
  const heightRef = useRef(window.innerHeight);

  // Keep latest values accessible inside the one-time effect without re-running it
  const jarsRef = useRef<JarData[]>(jars);
  const bodyIndexMapRef = useRef<Map<number, number>>(new Map()); // bodyId → loop index
  const onSelectJarRef = useRef(onSelectJar);
  const goldJarIdRef = useRef(goldJarId ?? null);
  const goldEndTimeRef = useRef(0);

  useEffect(() => { jarsRef.current = jars; }, [jars]);
  useEffect(() => { onSelectJarRef.current = onSelectJar; }, [onSelectJar]);
  useEffect(() => {
    goldJarIdRef.current = goldJarId ?? null;
    if (goldJarId) goldEndTimeRef.current = performance.now() + 5000;
  }, [goldJarId]);

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
      if (dist < 5) {
        const bodies = Matter.Composite.allBodies(world);
        const clickedBodies = Matter.Query.point(bodies, event.mouse.position);
        const clickedJar = clickedBodies.find(b => b.render?.sprite?.texture);
        if (clickedJar) {
          const idx = bodyIndexMapRef.current.get(clickedJar.id);
          if (idx !== undefined) {
            const currentJars = jarsRef.current;
            if (currentJars.length > 0) {
              const jar = currentJars[idx % currentJars.length];
              if (jar) onSelectJarRef.current(jar);
            }
          }
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

    // Draw jar label (title or owner name) centered on each falling body
    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      const currentJars = jarsRef.current;
      if (!currentJars.length) return;

      const pixelRatio = render.options.pixelRatio || 1;
      const allBodies = Matter.Composite.allBodies(world);

      ctx.save();
      ctx.scale(pixelRatio, pixelRatio);
      ctx.font = '9px "Courier New", Courier, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      allBodies.forEach(body => {
        if (body.isStatic) return;
        const idx = bodyIndexMapRef.current.get(body.id);
        if (idx === undefined) return;
        const jar = currentJars[idx % currentJars.length];
        if (!jar) return;

        const rawLabel = jar.title || jar.owner?.name || 'jar';
        const label = rawLabel.length > 14 ? rawLabel.slice(0, 13) + '\u2026' : rawLabel;

        // Position just below the jar's bounding box — no background
        const x = body.position.x;
        const y = body.bounds.max.y + 2;
        ctx.fillStyle = 'rgba(20, 20, 20, 0.82)';
        ctx.fillText(label, x, y);
      });

      // Pulsing gold glow on the newly created jar bodies
      const goldEnd = goldEndTimeRef.current;
      if (goldEnd > 0 && performance.now() < goldEnd) {
        const goldId = goldJarIdRef.current;
        const goldIndex = currentJars.findIndex(j => j._id === goldId);
        if (goldIndex !== -1) {
          const pulse = 0.35 + 0.35 * Math.sin(performance.now() / 180);
          ctx.save();
          allBodies.forEach(body => {
            if (body.isStatic) return;
            const idx = bodyIndexMapRef.current.get(body.id);
            if (idx === undefined || idx % currentJars.length !== goldIndex) return;
            const bw = (body.bounds.max.x - body.bounds.min.x) / 2 + 6;
            const bh = (body.bounds.max.y - body.bounds.min.y) / 2 + 6;
            ctx.fillStyle = `rgba(251, 191, 36, ${pulse})`;
            ctx.beginPath();
            ctx.ellipse(body.position.x, body.position.y, bw, bh, body.angle, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }
      }

      ctx.restore();
    });

    const jarImage = '/jar.png';
    const numJars = window.innerWidth > 768 ? 200 : 100;

    let timeoutIds: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < numJars; i++) {
      const tid = setTimeout(() => {
        const size = Math.random() * 110 + 40;
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
        bodyIndexMapRef.current.set(jar.id, i);
        Matter.Composite.add(world, jar);
      }, i * 20);
      timeoutIds.push(tid);
    }

    return () => {
      timeoutIds.forEach(clearTimeout);
      resizeObserver.disconnect();
      bodyIndexMapRef.current.clear();
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      if (engineRef.current) Matter.Engine.clear(engineRef.current);
      if (render.canvas) render.canvas.remove();
    };
  }, []); // onSelectJar and jars tracked via refs — no re-run needed

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-auto jar-canvas-container" />;
};
