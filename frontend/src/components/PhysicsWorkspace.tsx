import React, { useEffect, useRef, useState, forwardRef } from 'react';
import Matter from 'matter-js';

export interface PhysicsWorkspaceRef { }

interface PhysicsWorkspaceProps {
  defaultText: string;
  isDark?: boolean;
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
const LINE_HEIGHT = 46;
const RENDER_FONT = `500 32px 'DM Sans', sans-serif`;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export const PhysicsWorkspace = forwardRef<PhysicsWorkspaceRef, PhysicsWorkspaceProps>(({ defaultText, isDark = false }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Track isDark without re-running the physics useEffect
  const isDarkRef = useRef(isDark);
  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);

  // ── Typing UI state ──
  const [uiMode, setUiMode] = useState<'idle' | 'typing' | 'naming'>('idle');
  const uiModeRef = useRef<'idle' | 'typing' | 'naming'>('idle');
  const [fromName, setFromName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const typedTextRef = useRef('');
  const typedBodyIdsRef = useRef<Set<string>>(new Set());
  // Exposed so the React onSubmit handler can clear typed bodies from the world
  const clearTypedRef = useRef<() => void>(() => { });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // Let typed letters fall as the 'send' animation
    typedBodyIdsRef.current.forEach(id => {
      const body = bodiesRef.current[id];
      if (!body) return;
      if (body.isStatic) Matter.Body.setStatic(body, false);
      if (body.isSleeping) Matter.Sleeping.set(body, false);
      Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 2.5, y: Math.random() * 1.5 });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.18);
    });
    typedBodyIdsRef.current.clear();
    typedTextRef.current = '';
    uiModeRef.current = 'idle';
    setUiMode('idle');
    setFromName('');
    setIsAnonymous(false);
  };

  const bodiesRef = useRef<Record<string, Matter.Body>>({});
  const letterNodesRef = useRef<LetterData[]>([]);

  const stateRef = useRef<{ mode: 'static' | 'falling' | 'reviving'; reviveState: ReviveState | null }>({
    mode: 'static',
    reviveState: null,
  });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use setTransform (not scale) so resize never accumulates DPR scale
    const updateSize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

    // Mouse interaction
    const mouse = Matter.Mouse.create(canvas);
    (mouse as any).pixelRatio = window.devicePixelRatio || 1;
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.World.add(world, mouseConstraint);

    /**
     * Build letter physics bodies using actual character widths from ctx.measureText.
     * Always removes old bodies from the world and adds fresh ones — this fixes a
     * React StrictMode double-invoke bug where stale bodies from a cleared engine
     * would be reused but never added to the new engine's world.
     */
    const buildStaticText = (wPx: number, hPx: number) => {
      // Set font before measuring so we get accurate widths for DM Sans
      ctx.font = RENDER_FONT;

      const maxLineWidth = Math.min(800, wPx - 80);

      // Word-wrap using real measured text widths
      const words = defaultText.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(candidate).width > maxLineWidth && currentLine !== '') {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = candidate;
        }
      }
      if (currentLine !== '') lines.push(currentLine);

      const totalHeight = lines.length * LINE_HEIGHT;
      const startY = hPx / 2 - totalHeight / 2 + LINE_HEIGHT / 2;

      const newLetterNodes: LetterData[] = [];
      const newBodies: Record<string, Matter.Body> = {};
      let idCounter = 0;

      lines.forEach((line, lineIndex) => {
        const lineWidth = ctx.measureText(line).width;
        let cursorX = wPx / 2 - lineWidth / 2;
        const y = startY + lineIndex * LINE_HEIGHT;
        let charIdx = 0;

        for (const char of line) {
          const cw = ctx.measureText(char).width;

          if (char !== ' ') {
            const x = cursorX + cw / 2; // center of glyph
            const id = `letter-${idCounter++}`;
            // Radius based on actual glyph width, clamped to a sensible range
            const charRadius = Math.max(9, Math.min(cw * 0.48, 16));

            newLetterNodes.push({ id, char, targetX: x, targetY: y, lineIdx: lineIndex, charIdx });

            // Create as dynamic first so Matter.js saves _original mass/inertia.
            // If created with isStatic:true, _original is never set, causing
            // setStatic(false) to leave mass=Infinity → NaN velocity on Enter.
            const body = Matter.Bodies.circle(x, y, charRadius, {
              restitution: 0.3,
              friction: 0.7,
              frictionStatic: 0.9,
              density: 0.002,
              slop: 0.02,
              label: `letter:${char}`,
            });
            Matter.Body.setStatic(body, true);
            newBodies[id] = body;
          }

          cursorX += cw;
          charIdx++;
        }
      });

      // Remove all old bodies from the world before adding the new set
      const oldBodies = Object.values(bodiesRef.current);
      oldBodies.forEach(b => Matter.World.remove(world, b));

      Matter.World.add(world, Object.values(newBodies));

      bodiesRef.current = newBodies;
      letterNodesRef.current = newLetterNodes;
    };

    // Tracks whether the visitor has started typing (hides the hint)

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      ctx.font = RENDER_FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isDarkRef.current ? '#e8e8e8' : '#212121';

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
    render();

    // Expose the clear-typed-bodies function to the React event handlers above
    clearTypedRef.current = () => {
      typedBodyIdsRef.current.forEach(id => {
        const body = bodiesRef.current[id];
        if (body) Matter.World.remove(world, body);
        delete bodiesRef.current[id];
      });
      letterNodesRef.current = letterNodesRef.current.filter(n => !typedBodyIdsRef.current.has(n.id));
      typedBodyIdsRef.current.clear();
      typedTextRef.current = '';
    };

    // Render loop
    const tick = () => {
      Matter.Engine.update(engine, 1000 / 60);

      const bodies = bodiesRef.current;
      const sm = stateRef.current;

      if (sm.mode === 'static') {
        letterNodesRef.current.forEach(node => {
          if (node.lineIdx < 0) return; // typed letter — leave it dynamic
          const body = bodies[node.id];
          if (body && !body.isStatic) {
            Matter.Body.setStatic(body, true);
            Matter.Body.setPosition(body, { x: node.targetX, y: node.targetY });
            Matter.Body.setAngle(body, 0);
          }
        });
      } else if (sm.mode === 'reviving' && sm.reviveState) {
        const elapsed = performance.now() - sm.reviveState.startTime;

        letterNodesRef.current.forEach(node => {
          const body = bodies[node.id];
          const start = sm.reviveState!.starts[node.id];
          const target = sm.reviveState!.targets[node.id];
          if (!body || !start || !target) return;

          const localElapsed = elapsed - target.startDelayMs;
          if (localElapsed >= MOVE_DURATION_MS) {
            Matter.Body.setPosition(body, { x: target.x, y: target.y });
            Matter.Body.setAngle(body, 0);
            Matter.Body.setStatic(body, true);
          } else if (localElapsed > 0) {
            const eased = easeOutCubic(localElapsed / MOVE_DURATION_MS);
            Matter.Body.setPosition(body, {
              x: start.x + (target.x - start.x) * eased,
              y: start.y + (target.y - start.y) * eased,
            });
            Matter.Body.setAngle(body, start.angle * (1 - eased));
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
      // While the name bar is open, let the HTML input handle all keys
      if (uiModeRef.current === 'naming') return;

      const sm = stateRef.current;

      // Printable character — spawn a falling letter immediately
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Transition from idle to typing on first keystroke
        if (uiModeRef.current === 'idle') {
          uiModeRef.current = 'typing';
          setUiMode('typing');
        }
        typedTextRef.current += e.key;
        const char = e.key;
        ctx.font = RENDER_FONT;
        const cw = ctx.measureText(char).width;
        const charRadius = Math.max(9, Math.min(cw * 0.48, 16));
        const id = `typed-${Date.now()}-${Math.random()}`;
        const spawnX = w / 2 + (Math.random() - 0.5) * 80;
        const spawnY = h * 0.35;
        const body = Matter.Bodies.circle(spawnX, spawnY, charRadius, {
          restitution: 0.35,
          friction: 0.7,
          frictionStatic: 0.9,
          density: 0.002,
          slop: 0.02,
          label: `letter:${char}`,
        });
        Matter.World.add(world, body);
        bodiesRef.current[id] = body;
        typedBodyIdsRef.current.add(id);
        letterNodesRef.current.push({ id, char, targetX: spawnX, targetY: spawnY, lineIdx: -1, charIdx: -1 });
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        // In typing mode with content — open the name bar
        if (uiModeRef.current === 'typing' && typedTextRef.current.length > 0) {
          uiModeRef.current = 'naming';
          setUiMode('naming');
          return;
        }
        // In idle — original fall-all behaviour
        if (uiModeRef.current === 'idle' && sm.mode !== 'falling') {
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
        e.preventDefault();
        // In typing mode — clear typed letters and go back to idle
        if (uiModeRef.current === 'typing') {
          clearTypedRef.current();
          uiModeRef.current = 'idle';
          setUiMode('idle');
          return;
        }
        // In idle/falling — original revive behaviour
        if (uiModeRef.current === 'idle' && sm.mode === 'falling') {
          sm.mode = 'reviving';

          let maxDelay = 0;
          const starts: Record<string, { x: number; y: number; angle: number }> = {};
          const targets: Record<string, { x: number; y: number; angle: number; startDelayMs: number }> = {};

          letterNodesRef.current.forEach(node => {
            if (node.lineIdx < 0) return; // typed letter — keep it falling
            const body = bodiesRef.current[node.id];
            if (!body) return;
            const startDelayMs = node.lineIdx * INTER_LINE_DELAY_MS;
            if (startDelayMs > maxDelay) maxDelay = startDelayMs;
            starts[node.id] = { x: body.position.x, y: body.position.y, angle: body.angle };
            targets[node.id] = { x: node.targetX, y: node.targetY, angle: 0, startDelayMs };
            Matter.Body.setStatic(body, true);
            if (body.isSleeping) Matter.Sleeping.set(body, false);
          });

          sm.reviveState = {
            startTime: performance.now(),
            totalDurationMs: maxDelay + MOVE_DURATION_MS,
            starts,
            targets,
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

      // Rebuild text layout with new dimensions; reset to static
      stateRef.current.mode = 'static';
      stateRef.current.reviveState = null;
      buildStaticText(w, h);
      render();
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', resizeHandler);
      cancelAnimationFrame(animationFrameRef.current);
      // Clear refs so the next effect invocation (React StrictMode) starts fresh
      bodiesRef.current = {};
      letterNodesRef.current = [];
      typedBodyIdsRef.current.clear();
      typedTextRef.current = '';
      stateRef.current = { mode: 'static', reviveState: null };
      Matter.Engine.clear(engine);
    };
  }, [defaultText]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden touch-none pointer-events-auto"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Centered “type here” hint with blinking cursor — visible only in idle */}
      {uiMode === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none">
          <span
            className="font-body text-lg italic"
            style={{ color: isDark ? 'rgba(232,232,232,0.28)' : 'rgba(33,33,33,0.22)' }}
          >
            type here<span className="animate-blink not-italic font-normal">|</span>
          </span>
        </div>
      )}

      {/* Name / anonymous bar — appears after Enter while typing */}
      {uiMode === 'naming' && (
        <form
          onSubmit={handleSend}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-surface/92 backdrop-blur-sm border border-on-surface/15 rounded-full px-5 py-2.5 shadow-lg"
          style={{ animation: 'slideUp 0.2s ease-out' }}
        >
          <span className="font-pixel text-on-surface-variant text-xs whitespace-nowrap">from</span>
          <input
            autoFocus
            type="text"
            value={fromName}
            onChange={e => setFromName(e.target.value)}
            disabled={isAnonymous}
            placeholder="your name"
            className="font-body text-sm text-on-surface bg-transparent border-b border-amber-400 outline-none w-28 placeholder:text-on-surface-variant/40 disabled:opacity-30 disabled:cursor-not-allowed pb-0.5"
            onKeyDown={e => {
              e.stopPropagation();
              if (e.key === 'Escape') {
                e.preventDefault();
                uiModeRef.current = 'typing';
                setUiMode('typing');
                setFromName('');
                setIsAnonymous(false);
              }
            }}
          />
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              onKeyDown={e => e.stopPropagation()}
              className="accent-amber-400"
            />
            <span className="font-pixel text-on-surface-variant text-xs">anonymous</span>
          </label>
          <span className="font-pixel text-on-surface-variant/40 text-[10px] whitespace-nowrap hidden sm:inline">
            ↵ to send · esc to edit
          </span>
        </form>
      )}
    </div>
  );
});
