# Architecture diagram generator

Isolated Node script so `@excalidraw/excalidraw` stays out of the Expo app.

```bash
cd scripts/diagram
npm install
npm run generate
```

Writes:

- `docs/architecture.excalidraw` — editable source (open at [excalidraw.com](https://excalidraw.com))
- `docs/architecture.svg` — GitHub-renderable export
- `docs/architecture.png` — raster preview (resvg)

The generator bundles `convertToExcalidrawElements` and `exportToSvg` from `@excalidraw/excalidraw`, runs them in headless Chrome (Playwright), and rasterizes the SVG with `@resvg/resvg-js`. Chrome is required only to generate the files; the committed SVG/PNG do not need it.
