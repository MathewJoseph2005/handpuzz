# Last Horizon project guidance

- Use React + TypeScript + Vite.
- Keep the visual language restrained and atmospheric: near-black graphite, storm-cyan/teal highlights, desaturated olive shadows, and amber/red warnings only for meaningful state changes.
- Keep the center of the screen open for camera and puzzle content. HUD elements belong in corners and must not overlap the active surface.
- Keep per-frame vision data in refs or render-loop-owned objects, never React state.
- Keep camera frames and puzzle photos local. Never add a backend or external runtime image/font dependency without explicit approval.
- Prefer focused changes that match the architecture in the project specification.
