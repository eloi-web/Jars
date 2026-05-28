import React, { useEffect, useRef, forwardRef } from 'react';
import Matter from 'matter-js';

export interface PhysicsWorkspaceRef {}

interface PhysicsWorkspaceProps {
  defaultText: string;
}

interface LetterData {
  id: string;
  char: string;
  targetX: number;
  targetY: number;
}

const WALL_THICKNESS = 300;

export const PhysicsWorkspace = forwardRef<PhysicsWorkspaceRef, PhysicsWorkspaceProps>(({ defaultText }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  const bodiesRef = useRef<Record<string, Matter.Body>>({});
  const letterNodesRef = useRef<LetterData[]>([]);
  const isFallingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Size setup
    const updateSize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = w * pixelRatio;
      canvas.height = h * pixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(pixelRatio, pixelRatio);
      return { w, h };
    };
    
    let { w, h } = updateSize();

    // Engine setup
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.0014 },
      enableSleeping: true,
      positionIterations: 8,
      velocityIterations: 8,
    });
    engineRef.current = engine;
    const world = engine.world;

    let floor: Matter.Body, leftWall: Matter.Body, rightWall: Matter.Body, ceiling: Matter.Body;

    const createWalls = () => {
      floor = Matter.Bodies.rectangle(w / 2, h + WALL_THICKNESS / 2, w * 3, Math.max(WALL_THICKNESS, 60), { isStatic: true, friction: 0.8, restitution: 0.1 });
      leftWall = Matter.Bodies.rectangle(-WALL_THICKNESS / 2, h / 2, WALL_THICKNESS, h * 3, { isStatic: true, friction: 0.5, restitution: 0.1 });
      rightWall = Matter.Bodies.rectangle(w + WALL_THICKNESS / 2, h / 2, WALL_THICKNESS, h * 3, { isStatic: true, friction: 0.5, restitution: 0.1 });
      ceiling = Matter.Bodies.rectangle(w / 2, -WALL_THICKNESS / 2, w * 3, WALL_THICKNESS, { isStatic: true, friction: 0.5, restitution: 0.1 });
      Matter.World.add(world, [floor, leftWall, rightWall, ceiling]);
    };
    createWalls();

    // Mouse Interaction
    const mouse = Matter.Mouse.create(canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Matter.World.add(world, mouseConstraint);

    // Initial words prep
    const buildStaticText = (wPx: number, hPx: number) => {
      const words = defaultText.split(' ');
      const newLetterNodes: LetterData[] = [];
      const newBodies: Record<string, Matter.Body> = {};
      
      const charRadius = 14; 
      const charWidth = 20;
      const charHeight = 40;
      
      let lines: string[][] = [];
      let currentLine: string[] = [];
      let currentLineWidth = 0;
      const maxLineWidth = Math.min(800, wPx - 80);

      words.forEach(word => {
        const wordWidth = word.length * charWidth;
        if (currentLineWidth + wordWidth > maxLineWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [];
          currentLineWidth = 0;
        }
        word.split('').forEach(c => currentLine.push(c));
        currentLine.push(' ');
        currentLineWidth += wordWidth + charWidth;
      });
      if (currentLine.length > 0) lines.push(currentLine);

      const totalHeight = lines.length * charHeight;
      const startY = hPx / 2 - totalHeight / 2;

      let idCounter = 0;

      lines.forEach((line, lineIndex) => {
        const lineWidth = line.length * charWidth;
        const startX = wPx / 2 - lineWidth / 2;

        line.forEach((char, charIndex) => {
          if (char === ' ') return; // don't push bodies for space
          const x = startX + charIndex * charWidth;
          const y = startY + lineIndex * charHeight;
          const id = `letter-${idCounter++}`;
          
          newLetterNodes.push({ id, char, targetX: x, targetY: y });
          
          if (!bodiesRef.current[id]) {
            const body = Matter.Bodies.circle(x, y, charRadius, {
              isStatic: true,
              restitution: 0.3,
              friction: 0.7,
              frictionStatic: 0.9,
              density: 0.002,
              slop: 0.02,
            });
            newBodies[id] = body;
          } else {
             newBodies[id] = bodiesRef.current[id];
          }
        });
      });

      // Add only new ones, if needed, but here we just rebuild positions.
      const toAdd = Object.values(newBodies).filter(b => !bodiesRef.current[Object.keys(newBodies).find(k => newBodies[k] === b)!]);
      Matter.World.add(world, toAdd);
      
      bodiesRef.current = newBodies;
      letterNodesRef.current = newLetterNodes;
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      
      ctx.font = `500 32px 'DM Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#212121';

      letterNodesRef.current.forEach(node => {
        const body = bodiesRef.current[node.id];
        if (!body) return;

        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);
        ctx.fillText(node.char, 0, 0);
        ctx.restore();
      });
    };

    buildStaticText(w, h);
    render(); // Initial render

    // Render loop
    const tick = () => {
      Matter.Engine.update(engine, 1000 / 60);

      const bodies = bodiesRef.current;
      const fall = isFallingRef.current;

      letterNodesRef.current.forEach(node => {
        const body = bodies[node.id];
        if (!body) return;

        if (!fall) {
            // Restore smoothly
            Matter.Body.setStatic(body, false);
            
            const dx = node.targetX - body.position.x;
            const dy = node.targetY - body.position.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 2) {
               const velocityX = dx * 0.08;
               const velocityY = dy * 0.08;
               const forceX = (velocityX - body.velocity.x) * 0.005;
               const forceY = (velocityY - body.velocity.y) * 0.005 - engine.gravity.y * engine.gravity.scale * body.mass;
               Matter.Body.applyForce(body, body.position, { x: forceX, y: forceY });
               Matter.Body.setAngularVelocity(body, (body.angularVelocity as number) * 0.85);
            } else {
               Matter.Body.setPosition(body, { x: node.targetX, y: node.targetY });
               Matter.Body.setAngle(body, 0);
               Matter.Body.setVelocity(body, { x: 0, y: 0 });
               Matter.Body.setAngularVelocity(body, 0);
               Matter.Body.setStatic(body, true);
               if (body.isSleeping) Matter.Sleeping.set(body, false);
            }
        }
      });

      render();
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        isFallingRef.current = true;
        Object.values(bodiesRef.current).forEach(body => {
          Matter.Body.setStatic(body, false);
          if (body.isSleeping) Matter.Sleeping.set(body, false);
          if (Math.abs(body.velocity.y) < 0.1 && Math.abs(body.velocity.x) < 0.1) {
            Matter.Body.setVelocity(body, {
                x: (Math.random() - 0.5) * 4,
                y: Math.random() * 2,
            });
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
          }
        });
      }
      if (e.key === 'Escape') {
        isFallingRef.current = false;
        Object.values(bodiesRef.current).forEach(body => {
           if (body.isSleeping) Matter.Sleeping.set(body, false);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const resizeHandler = () => {
      const size = updateSize();
      w = size.w;
      h = size.h;
      Matter.Body.setPosition(floor, { x: w / 2, y: h + WALL_THICKNESS / 2 });
      Matter.Body.setPosition(leftWall, { x: -WALL_THICKNESS / 2, y: h / 2 });
      Matter.Body.setPosition(rightWall, { x: w + WALL_THICKNESS / 2, y: h / 2 });
      Matter.Body.setPosition(ceiling, { x: w / 2, y: -WALL_THICKNESS / 2 });
      buildStaticText(w, h);
      render(); // force render on resize
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', resizeHandler);
      cancelAnimationFrame(animationFrameRef.current);
      Matter.Engine.clear(engine);
    };
  }, [defaultText]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden touch-none pointer-events-auto"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
});
