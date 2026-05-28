# JARS

JARS is an interactive web application that blends physics constraints and word typography into an intuitive message-in-a-jar visualization engine. Build and interact with virtual text objects!

## Architecture

This application is built using:
- **React 19**
- **Vite** (as the build toolkit)
- **Tailwind CSS v4** (for styling)
- **Matter.js** (for physics simulation of characters)

Everything is strictly typed with **TypeScript**.

## Running Locally

I recommend using **pnpm** for package management, to ensure robust and blazing fast dependency resolution.

### Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the local Vite server:
   ```bash
   pnpm run dev
   ```

### Production Build

1. Build the frontend into static files (emits to `dist/` folder):
   ```bash
   pnpm run build
   ```

2. To preview the production bundle locally:
   ```bash
   pnpm run preview
   ```
