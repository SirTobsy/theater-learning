# theater-learning

A free-to-use theater script learning app built with Svelte.
All text-to-speech models run locally on the client side, so nothing leaves your device.

## Features

- Script display with dialogue, stage directions and scene breaks
- Per-character voice selection
- Choice of TTS model (will be extended in the future): 
  - [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M)
  - [SpeechT5](https://huggingface.co/Xenova/speecht5_tts)
- Rehearsal settings: read your own lines, beep on your own lines, pause duration and volume
- Quick presets for common modes (e.g. Practice Mode, Full Read)
- Runs in the browser with GitHub Pages on [github.io](https://sirtobsy.github.io/theater-learning/)

## Technologies

- SvelteKit (static SPA via `adapter-static`)
- Svelte 5 (runes)
- TypeScript
- shadcn-svelte / bits-ui
- Tailwind CSS
- [`kokoro-js`](https://www.npmjs.com/package/kokoro-js) and [`@huggingface/transformers`](https://www.npmjs.com/package/@huggingface/transformers) for local TTS
- Capacitor for mobile
- Vitest + Testing Library for tests

# Getting Started

## Prerequisites

- node
- [pnpm](https://pnpm.io/)

## Install and run

```bash
pnpm install
pnpm dev
```

## Scripts

| Command                | Description                                  |
|------------------------|----------------------------------------------|
| `pnpm dev`             | Start the Vite dev server                    |
| `pnpm build`           | Production build into `dist/`                |
| `pnpm build:dev`       | Build in development mode                    |
| `pnpm preview`         | Serve the production build locally           |
| `pnpm test`            | Run the Vitest test suite                    |
| `pnpm check`           | Type-check with `svelte-check`               |
| `pnpm lint`            | Lint with ESLint                             |
| `pnpm format`          | Format with Prettier                         |

## Show in the browser (preview)

```bash
pnpm build
pnpm preview
```