# react-templates

Reusable React widgets for landing pages. Each widget is a self-contained, props-driven section you can drop into a marketing page, restyle with CSS variables, and wire to your own data.

TypeScript, CSS Modules, no runtime dependencies besides React.

**[Live demo →](https://zaelyn-ng.github.io/react-templates/)**

## Widgets

| Widget | What it is | Docs |
| --- | --- | --- |
| `QuarterTimeline` | Horizontal roadmap by quarter with tiles that open a detail modal | [src/QuarterTimeline](src/QuarterTimeline/README.md) |
| `PillsToDots` | Scroll-driven hero: a list of pills collapses into dots, then converges into an arrow | [src/PillsToDots](src/PillsToDots/README.md) |

More to come. See [Adding a widget](#adding-a-widget).

## Quick start

```bash
git clone https://github.com/zaelyn-ng/react-templates
cd react-templates
npm install
npm run dev        # demo app with every widget
```

## Using a widget

**Copy and paste (simplest).** Each widget folder in `src/` is self-contained. Copy the folder into your app, import the component, and edit it freely.

**As a package.** Build the library and import from it:

```bash
npm run build
```

```tsx
import { QuarterTimeline, PillsToDots } from "react-templates";
import "react-templates/style.css";
```

## Principles

- **Props over hard-coding.** Content, labels and data come in as props. Nothing is baked into the markup.
- **Themeable.** Colors and surfaces are CSS custom properties, scoped per widget (`--qt-*`, `--pd-*`). Override them on the `className` you pass in.
- **Fonts and layout are yours.** Widgets inherit `font-family` and fill their container. No global styles, no resets.
- **Accessible by default.** Real buttons, keyboard support, native `<dialog>` for modals, `prefers-reduced-motion` respected.
- **Controlled or uncontrolled.** Stateful widgets accept `value` / `defaultValue` / `onChange`.
- **No third-party branding.** Original designs only, with placeholder content in the demo.

## Adding a widget

1. Create `src/MyWidget/` with `index.tsx`, `types.ts` and `styles.module.css`.
2. Scope theme variables with a short prefix (e.g. `--mw-*`) and document them in `src/MyWidget/README.md`.
3. Export it and its types from `src/index.ts`.
4. Add an example with placeholder data to `demo/main.tsx`.
5. Run `npm run typecheck && npm run build`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the demo app |
| `npm run build` | Typecheck and build the library to `dist/` |
| `npm run build:demo` | Build the demo to `demo-dist/` for static hosting |
| `npm run typecheck` | TypeScript check only |

## License

MIT
