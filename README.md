# VOLT COLA — Turn It Up

A bold, cinematic landing page for VOLT COLA, built with React, Vite, and Three.js. The experience pairs smooth scroll-reactive motion with a 3D product scene and a responsive, high-contrast visual design.

## Features

- Scroll-reactive page progress and hero motion
- Lazy-loaded 3D scenes with lightweight poster fallbacks
- Reduced-motion support
- Responsive layout for desktop and mobile
- Flavor showcase and interactive navigation
- Custom pointer effects on devices that support them

## Getting started

Use Node.js with npm installed, then run these commands from the project directory:

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal when the server starts.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Production build

```bash
npm run build
npm run preview
```

The generated site is in `dist/`. Deploy that directory to a static hosting provider.

## Tech stack

- React 19
- Vite 8
- Three.js with React Three Fiber
- CSS

## Project structure

```text
src/
  App.jsx       Page sections, navigation, scroll behavior, and lazy scene loading
  Scene3D.jsx   Three.js product and atmosphere scenes
  flavors.js    Flavor content
  main.jsx      React entry point
  style.css     Layout, visual styles, and animations
```
