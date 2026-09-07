# Project: Last Horizon

A hand-controlled live puzzle terminal built with React, TypeScript, and Vite.

## Current status

The project currently contains these checkpoints:

- Restrained doomsday command-terminal BOOT screen with staged diagnostics, local-processing privacy copy, responsive layout, scanlines, grain, vignette, graphite surfaces, storm-cyan accents, olive shadows, and amber system states.
- Camera permission flow with mirrored live preview, explicit permission/device errors, stream cleanup, and manual fallback.
- Strictly typed vision foundation for local MediaPipe HandLandmarker assets, two-hand tracking, debounced OPEN/PINCH/FIST poses, and smoothed two-hand framing geometry.
- Local MediaPipe hand model and WASM runtime files under `public/models`.
- Live capture path with two-hand framing, skeleton overlay, and pinch-to-snap capture.
- Hand solving path with pinch drag/release swaps and fist-hold reshuffling.
- Manual playable fallback: local square image upload, 3x3 or 4x4 selection, swap-based canvas puzzle, timer, reset, and completion screen.
- Offline top-20 leaderboard backed by localStorage.
- Hidden diagnostics overlay toggled with `Ctrl+Shift+D`.

Camera frames and leaderboard data remain on-device. The manual path remains playable without camera access.

## Commands

```text
npm install
npm run dev
npm run typecheck
npm run build
```

Run `npm run dev` and open the local Vite URL to test the app. Camera and hand tracking require browser permission and a compatible webcam; selecting `CONTINUE WITHOUT CAMERA` exercises the manual path.
