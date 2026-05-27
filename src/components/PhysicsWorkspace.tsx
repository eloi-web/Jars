import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';

export interface PhysicsWorkspaceRef {
  dropText: (text: string) => void;
}

interface PhysicsWorkspaceProps {}

export const PhysicsWorkspace = forwardRef<PhysicsWorkspaceRef, PhysicsWorkspaceProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  
  const widthRef = useRef(window.innerWidth);
  const heightRef = useRef(window.innerHeight);

  const lettersRef = useRef<{ body: Matter.Body; char: string; wordId: string; index: number; originalWord: string }[]>([]);
  const unbreakingLettersRef = useRef<Set<Matter.Body>>(new Set());

  useImperativeHandle(ref, () => ({
    dropText: (text: string) => {
      if (!engineRef.current || !text.trim()) return;
      
      const width = widthRef.current;
      const spawnX = width / 2;
      const spawnY = 100;

      const words = text.split(' ');
      let charIndexGlobal = 0;
      
      const wordIdTemplate = Date.now().toString();

      words.forEach((word, wordIndex) => {
        const wordId = `${wordIdTemplate}-${wordIndex}`;
        const chars = word.split('');
        
        chars.forEach((char, index) => {
          setTimeout(() => {
            const scatterX = spawnX + (Math.random() * 200 - 100);
            const letter = spawnLetter(char, scatterX, spawnY, word, index, wordId);
            
            Matter.Body.setVelocity(letter, {
              x: (Math.random() - 0.5) * 8,
              y: Math.random() * 4 - 2,
            });
            Matter.Body.setAngularVelocity(letter, (Math.random() - 0.5) * 0.4);
          }, charIndexGlobal * 80);
          
          charIndexGlobal++;
        });
      });
    }
  }));

  const generateLetterTexture = (char: string, size: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `bold ${size * 1.5}px "Courier Prime", monospace`;
      ctx.fillStyle = '#212121';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, size, size);
    }
    return canvas.toDataURL();
  };

  const spawnLetter = (char: string, x: number, y: number, originalWord: string, index: number, wordId: string) => {
    const size = 20 + Math.random() * 12;
    const letter = Matter.Bodies.rectangle(x, y, size, size, {
      restitution: 0.3,
      friction: 0.8,
      density: 0.04,
      render: {
        sprite: {
          texture: generateLetterTexture(char, size)
        }
      }
    });

    (letter as any).customData = {
      char,
      wordId,
      index,
      originalWord,
      relativeX: (index * 22) - (originalWord.length * 11),
      size
    };

    lettersRef.current.push({ body: letter, char, wordId, index, originalWord });
    if (engineRef.current) {
      Matter.Composite.add(engineRef.current.world, letter);
    }
    return letter;
  };

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

    const wallOptions = { isStatic: true, render: { visible: false } };
    let boundaries: Matter.Body[] = [];

    const createBoundaries = () => {
      const w = widthRef.current;
      const h = heightRef.current;
      const t = 60; // thickness
      
      if (boundaries.length > 0) {
        Matter.Composite.remove(world, boundaries);
      }

      const ground = Matter.Bodies.rectangle(w / 2, h - 30 + t / 2, w, t, wallOptions);
      const leftWall = Matter.Bodies.rectangle(-t / 2, h / 2, t, h, wallOptions);
      const rightWall = Matter.Bodies.rectangle(w + t / 2, h / 2, t, h, wallOptions);
      const ceiling = Matter.Bodies.rectangle(w / 2, -t / 2 - 200, w, t, wallOptions); // Higher ceiling

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

    // Initial words drop
    const dropInitialWords = () => {
      const intro = "pixel jar".split(' ');
      let delay = 500;
      const wTemplate = Date.now().toString();
      intro.forEach((word, wIdx) => {
        word.split('').forEach((char, i) => {
          setTimeout(() => spawnLetter(char, widthRef.current / 2 + (Math.random() * 80 - 40), 50, word, i, `${wTemplate}-${wIdx}`), delay);
          delay += 100;
        });
        delay += 300;
      });
    };
    dropInitialWords();

    // Mouse Interaction
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Matter.Composite.add(world, mouseConstraint);
    
    // Disable default scrolling on mouse wheel in the canvas
    if (render.canvas.parentNode) {
      (render.canvas as any).addEventListener('wheel', (e: Event) => e.preventDefault(), { passive: false });
    }

    let lastClickTime = 0;
    Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
      const currentTime = new Date().getTime();
      const clickDelay = currentTime - lastClickTime;
      const mousePosition = event.mouse.position;
      
      if (clickDelay < 350) {
        // Double click
        const bodies = Matter.Composite.allBodies(world);
        const clickedBodies = Matter.Query.point(bodies, mousePosition);
        
        if (clickedBodies.length > 0) {
          const clickedBody = clickedBodies[0];
          const data = (clickedBody as any).customData;
          
          if (data && data.wordId) {
            const wordId = data.wordId;
            lettersRef.current.forEach(item => {
              const bData = (item.body as any).customData;
              if (bData && bData.wordId === wordId) {
                Matter.Body.setStatic(item.body, false);
                unbreakingLettersRef.current.add(item.body);
                Matter.Body.setVelocity(item.body, { x: (Math.random() - 0.5) * 5, y: -12 });
              }
            });
          }
        }
      } else {
        // Single click - release if unbreaking
        const bodies = Matter.Composite.allBodies(world);
        const clickedBodies = Matter.Query.point(bodies, mousePosition);
        
        if (clickedBodies.length > 0) {
          const clickedBody = clickedBodies[0];
          if (unbreakingLettersRef.current.has(clickedBody)) {
            const data = (clickedBody as any).customData;
            if (data && data.wordId) {
              const wordId = data.wordId;
              lettersRef.current.forEach(item => {
                const bData = (item.body as any).customData;
                if (bData && bData.wordId === wordId && unbreakingLettersRef.current.has(item.body)) {
                  unbreakingLettersRef.current.delete(item.body);
                  Matter.Body.setStatic(item.body, false);
                  Matter.Body.setVelocity(item.body, { x: (Math.random() - 0.5) * 5, y: -5 });
                }
              });
            }
          }
        }
      }
      
      lastClickTime = currentTime;
    });

    Matter.Events.on(engine, 'beforeUpdate', () => {
      const centerX = widthRef.current / 2;
      const centerY = heightRef.current / 2.5; // Slightly above center
      
      unbreakingLettersRef.current.forEach(body => {
        const data = (body as any).customData;
        if (!data) return;
        
        const targetX = centerX + data.relativeX;
        const targetY = centerY;
        
        const dx = targetX - body.position.x;
        const dy = targetY - body.position.y;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
          Matter.Body.applyForce(body, body.position, {
            x: dx * 0.00015,
            y: dy * 0.00015 - engine.gravity.y * engine.gravity.scale * body.mass 
          });
          Matter.Body.setAngularVelocity(body, (body.angularVelocity as number) * 0.85);
        } else {
          Matter.Body.setPosition(body, { x: targetX, y: targetY });
          Matter.Body.setAngle(body, 0);
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(body, 0);
          Matter.Body.setStatic(body, true);
        }
      });
    });

    return () => {
      resizeObserver.disconnect();
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
      if (render.canvas) {
        render.canvas.remove();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 pointer-events-auto overflow-hidden" 
    />
  );
});
