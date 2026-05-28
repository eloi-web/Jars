# JARS

JARS is an interactive web app where text messages come alive through physics. Letters from a message float in a jar — press **Enter** to let them scatter and fall with gravity, press **Escape** to animate them back into place. The home screen rains down a shower of jar images you can drag and fling before clicking one to enter.

---

## Features

- **Physics-driven text** — Each character in a message is an independent Matter.js rigid body that responds to gravity, collisions, and mouse interaction.
- **Enter / Escape controls** — Press `Enter` to release letters into freefall; press `Escape` to smoothly tween them back to their original positions.
- **Interactive jar rain** — The home screen spawns hundreds of jar sprites that fall and stack; drag them with the mouse, click one to open a jar.
- **Create a Jar modal** — Name a new jar and optionally add an initial message.
- **Login modal** — Credential form with Google OAuth placeholder.
- **Responsive layout** — Adapts jar count and text sizing for mobile vs. desktop.
- **Pixel / serif typography** — Four custom Google Fonts (Pixelify Sans, Instrument Serif, DM Sans, Courier Prime).

---

## Tech Stack

| Concern | Library |
|---|---|
| UI framework | React 19 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Physics engine | Matter.js 0.20 |
| Icons | Lucide React |
| Language | TypeScript 5.8 |

---

## Project Structure

```
src/
├── App.tsx                      # Root — screen router + modal state
├── main.tsx                     # ReactDOM entry point
├── index.css                    # Tailwind v4 theme + custom keyframes
└── components/
    ├── HomeScreen.tsx            # Landing page shell
    ├── HomePhysicsWorkspace.tsx  # Matter.js jar-rain canvas (home)
    ├── JarScreen.tsx             # Individual jar view shell
    ├── PhysicsWorkspace.tsx      # Matter.js letter-physics canvas (jar)
    ├── CreateJarModal.tsx        # "New Jar" form modal
    └── LoginModal.tsx            # Login / Google sign-in modal
```

### Component overview

**`App.tsx`** — Owns the two-screen navigation state (`home` | `jar`) and the open/close state for both modals. All navigation and modal callbacks are prop-drilled from here.

**`HomeScreen.tsx`** — Renders the full-screen layout: a pixel-font login button top-right, a jar image with a "Create a Jar" button in the centre, and the `HomePhysicsWorkspace` canvas behind everything.

**`HomePhysicsWorkspace.tsx`** — Sets up a Matter.js `Render` + `Runner` pipeline. Spawns jar sprites at randomised positions above the viewport with staggered `setTimeout` delays. Handles mouse drag via `MouseConstraint` and distinguishes a click (≤ 5 px drag) from a drag to trigger `onJarClick`.

**`JarScreen.tsx`** — The view of a single jar. Renders `PhysicsWorkspace` with a hardcoded demo message, a back button, and a keyboard-hint footer.

**`PhysicsWorkspace.tsx`** — Custom canvas render loop (no Matter.js renderer). Builds one circular rigid body per non-space character, positions them as centred text lines, and implements three modes:
- `static` — bodies frozen at target positions.
- `falling` — bodies released as dynamic, gravity pulls them down.
- `reviving` — bodies tweened back to targets with a staggered per-line delay using `easeOutCubic`.

**`CreateJarModal.tsx`** — Controlled form with jar name + initial message fields. Currently calls `onClose` on submit (persistence not yet wired).

**`LoginModal.tsx`** — Login form (name + password) with a Google sign-in button. Auth not yet wired.

---

## Getting Started

> Requires **Node.js 18+** and [pnpm](https://pnpm.io/).

### Install dependencies

```bash
pnpm install
```

### Run the dev server

```bash
pnpm dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Production build

```bash
pnpm build        # emits to dist/
pnpm preview      # serve the built bundle locally
```

### Type-check only

```bash
pnpm lint         # runs tsc --noEmit
```

---

## Keyboard Controls (Jar screen)

| Key | Action |
|---|---|
| `Enter` | Release all letters into freefall |
| `Escape` | Animate letters back to their original positions |
| Mouse drag | Push / throw individual letters |

---

## Customisation

### Changing the demo message

Edit `displayMessage` in [src/components/JarScreen.tsx](src/components/JarScreen.tsx):

```tsx
const displayMessage = "Your custom message here.";
```

### Adjusting physics feel

Constants at the top of [src/components/PhysicsWorkspace.tsx](src/components/PhysicsWorkspace.tsx):

```ts
const MOVE_DURATION_MS = 600;      // tween duration when reviving
const INTER_LINE_DELAY_MS = 100;   // stagger delay between lines
```

### Theme colours

All design tokens are defined in [src/index.css](src/index.css) under the `@theme` block using Tailwind v4's CSS variable syntax.
