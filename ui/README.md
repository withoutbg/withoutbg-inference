# Background Removal Editor

An open-source, single-page background removal editor built with Next.js 15.
The UI matches the [withoutBG](https://withoutbg.com) design system: monochrome
Stripe/Vercel-style, dark mode by default.

## Features

- Drag, click, or paste (`Cmd/Ctrl+V`) to upload any image
- Animated processing preview with scan-line effect
- Before/after comparison slider
- Background picker: transparent checkerboard, white, black
- Download result as PNG
- Light/dark mode toggle

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Connecting a real background removal API

Processing is currently mocked via a canvas-based elliptical alpha matte.
To connect a real API, implement the `ProcessorFn` interface in
`src/lib/processor.ts` and wire it into `useMockProcessor.ts`:

```ts
// src/lib/processor.ts
export type ProcessorFn = (src: string) => Promise<{
  processed: string;   // transparent PNG data URL
  alphaMatte: string;  // grayscale RGB data URL (white = subject)
  latencyMs: number | null;
}>;
```

The UI pipeline (ComparisonSlider luminance mask, ProcessingPreview) works
with any implementation that satisfies this interface.

## Design system sync

These files are derived from [web-ui](https://github.com/withoutbg/web-ui) and
should be updated when the upstream editor UI changes:

| File | Source |
|------|--------|
| `src/lib/theme-colors.ts` | `src/lib/theme-colors.ts` |
| `src/app/globals.css` | `src/app/globals.css` (tokens + wbg animations) |
| `src/components/editor/ComparisonSlider.tsx` | `src/components/ui/landing/HeroComparisonSlider.tsx` |
| `src/components/editor/ProcessingPreview.tsx` | `src/components/remove-background/ProcessingPreview.tsx` |
| `src/components/editor/BackgroundRemovalEditor.tsx` | `src/components/remove-background/LiveDemoIsland.tsx` (sync visual classNames) |

## Stack

- [Next.js 15](https://nextjs.org) · App Router
- [Tailwind CSS 3.4](https://tailwindcss.com)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [lucide-react](https://lucide.dev)
