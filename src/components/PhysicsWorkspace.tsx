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
  lineIdx: number;
  charIdx: number;
}

interface ReviveState {
  startTime: number;
  totalDurationMs: number;
  starts: Record<string, { x: number; y: number; angle: number }>;
  targets: Record<string, { x: number; y: number; angle: number; startDelayMs: number }>;
}

const WALL_THICKNESS = 300;
const MOVE_DURATION_MS = 600;
const INTER_LINE_DELAY_MS = 100;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export const PhysicsWorkspace = forwardRef<PhysicsWorkspaceRef, PhysicsWorkspaceProps>(({ defaultText }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  const bodiesRef = useRef<Record<string, Matter.Body>>({});
  const letterNodesRef = useRef<LetterData[]>([]);
  
  const stateRef = useRef<{ mode: 'static' | 'falling' | 'reviving'; reviveState: ReviveState | null }>({
    mode: 'static',
    reviveState: null
  });

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
          
          newLetterNodes.push({ id, char, targetX: x, targetY: y, lineIdx: lineIndex, charIdx: charIndex });
          
          if (!bodiesRef.current[id]) {
            const body = Matter.Bodies.circle(x, y, charRadius, {
              isStatic: true,
              restitution: 0.3,
              friction: 0.7,
              frictionStatic: 0.9,
              density: 0.002,
              slop: 0.02,
              label: `letter:${char}`,
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
      const sm = stateRef.current;

      if (sm.mode === 'static') {
         // keep perfectly aligned just in case
         letterNodesRef.current.forEach(node => {
            const body = bodies[node.id];
            if (body && !body.isStatic) {
               Matter.Body.setStatic(body, true);
               Matter.Body.setPosition(body, { x: node.targetX, y: node.targetY });
               Matter.Body.setAngle(body, 0);
            }
         });
      } else if (sm.mode === 'reviving' && sm.reviveState) {
         const now = performance.now();
         const elapsed = now - sm.reviveState.startTime;
         const remainingIds: string[] = [];
         
         letterNodesRef.current.forEach(node => {
            const body = bodies[node.id];
            const start = sm.reviveState!.starts[node.id];
            const target = sm.reviveState!.targets[node.id];
            
            if (body && start && target) {
                const localElapsed = elapsed - target.startDelayMs;
                if (localElapsed >= MOVE_DURATION_MS) {
                    Matter.Body.setPosition(body, { x: target.x, y: target.y });
                    Matter.Body.setAngle(body, 0);
                    // body is technically static during tween, let's keep it static
                    Matter.Body.setStatic(body, true);
                } else if (localElapsed > 0) {
                    const t = localElapsed / MOVE_DURATION_MS;
                    const eased = easeOutCubic(t);
                    Matter.Body.setPosition(body, {
                        x: start.x + (target.x - start.x) * eased,
                        y: start.y + (target.y - start.y) * eased,
                    });
                    Matter.Body.setAngle(body, start.angle + (target.angle - start.angle) * eased);
                    remainingIds.push(node.id); // still moving
                } else {
                    remainingIds.push(node.id); // hasn't started moving yet
                }
            }
         });

         if (elapsed >= sm.reviveState.totalDurationMs) {
             sm.mode = 'static';
             sm.reviveState = null;
         }
      }

      render();
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    const handleKeyDown = (e: KeyboardEvent) => {
      const sm = stateRef.current;
      if (e.key === 'Enter') {
        if (sm.mode !== 'falling') {
            sm.mode = 'falling';
            sm.reviveState = null;

            Object.values(bodiesRef.current).forEach(body => {
              Matter.Body.setStatic(body, false);
              if (body.isSleeping) Matter.Sleeping.set(body, false);
              
              Matter.Body.setVelocity(body, {
                  x: (Math.random() - 0.5) * 2.5,
                  y: Math.random() * 1.5,
              });
              Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.18);
            });
        }
      }
      if (e.key === 'Escape') {
        if (sm.mode !== 'reviving' && sm.mode !== 'static') {
            sm.mode = 'reviving';
            
            let maxDelay = 0;
            const starts: Record<string, {x:number, y:number, angle:number}> = {};
            const targets: Record<string, {x:number, y:number, angle:number, startDelayMs:number}> = {};

            letterNodesRef.current.forEach(node => {
                const body = bodiesRef.current[node.id];
                if (!body) return;
                
                const startDelayMs = node.lineIdx * INTER_LINE_DELAY_MS;
                if (startDelayMs > maxDelay) maxDelay = startDelayMs;

                starts[node.id] = { x: body.position.x, y: body.position.y, angle: body.angle };
                targets[node.id] = { x: node.targetX, y: node.targetY, angle: 0, startDelayMs };
                
                // Freeze body dynamics to give pure tween control
                Matter.Body.setStatic(body, true);
                if (body.isSleeping) Matter.Sleeping.set(body, false);
            });

            sm.reviveState = {
                startTime: performance.now(),
                totalDurationMs: maxDelay + MOVE_DURATION_MS,
                starts,
                targets
            };
        }
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
      
      // Update targets on resize
      buildStaticText(w, h);
      
      if (stateRef.current.mode === 'static') {
          letterNodesRef.current.forEach(node => {
              const body = bodiesRef.current[node.id];
              if (body) {
                  Matter.Body.setPosition(body, { x: node.targetX, y: node.targetY });
                  Matter.Body.setAngle(body, 0);
              }
          });
      }
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
