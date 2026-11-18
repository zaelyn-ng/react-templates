# PillsToDots

A scroll-driven hero. A stacked list of pills collapses one by one into dots, the dots drift apart, then converge into a single circle with an arrow. The hero stays pinned in the middle of the screen while it plays, then scrolls away.

```tsx
import { PillsToDots } from "react-templates";
import "react-templates/style.css";

<PillsToDots
  heading="Your headline goes here"
  description="A short supporting sentence."
  actions={<a href="/contact">Get in touch</a>}
  items={[
    { label: "strategy", icon: "plus" },
    { label: "research", icon: "search" },
    { label: "automation", icon: "chip" },
    // …5–10 items works best
  ]}
/>
```

Place it at the very top of the page as a hero. Whatever section follows it appears after the pin releases.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `{ label, icon? }[]` | required | Any count; 5–10 looks best. `icon` is a built-in name or your own element. |
| `heading` | `ReactNode` | required | Rendered as `<h1>` (or `<h2>` with `headingLevel={2}`). |
| `description` | `ReactNode` | | Text under the heading. |
| `actions` | `ReactNode` | | Buttons or links under the text. |
| `direction` | `"collapse" \| "expand"` | `"collapse"` | `"expand"` plays it in reverse. |
| `scrollLength` | `number` | `1400` | Px of scrolling the animation takes while pinned. |
| `startDelay` | `number` | `150` | Px of scrolling before anything moves. |
| `smoothRate` | `number` | `9` | Higher follows the scrollbar tighter, lower is floatier, `0` disables smoothing. |
| `overlap` | `number` | `1.2` | How much neighbouring pills overlap. `0` is strictly one by one. |
| `pillsEnd` | `number` | `0.68` | Share of the scroll spent turning pills into dots. |
| `arrowAt` | `number` | `0.88` | Progress at which the arrow starts drawing. |
| `dotPositions` | `[xFraction, yPx][]` | auto | Where each dot lands. Keep each dot's y at or above its own pill's row so it never crosses a pill that hasn't collapsed. |
| `onProgress` | `(p: number) => void` | | Called with progress 0–1 as it changes. |
| `className` | `string` | | For theming. |

Built-in icons: `plus`, `spark`, `chip`, `chart`, `link`, `wave`, `layers`, `search`. Pass your own element (use `currentColor`) for anything else.

## Theme variables

```css
.my-hero {
  --pd-ink: #0b1417;    /* text, dark circles, big circle */
  --pd-panel: #eeefec;  /* panel background */
  --pd-pill: #fcfbf8;   /* pill background */
  --pd-tile: #eeefec;   /* icon tile before it turns dark */
  --pd-gray: #a0a3a1;   /* pill background while collapsing */
  --pd-arrow: #fcfbf8;  /* arrow colour */
  --pd-bg: transparent; /* background of the pinned row */
}
```

## Notes

- **Accessibility:** the animated panel is `aria-hidden`; the labels are also listed for screen readers. With `prefers-reduced-motion`, the animation still follows scroll but without smoothing or drifting.
- **Browser support:** uses `position: sticky` and CSS `color-mix()` (all current browsers).
- **Mobile:** if the row is taller than the screen, the panel stays in view while the text scrolls off.
- **Performance:** dots move with transforms and the animation pauses when the hero is off-screen. Scrolling does no layout reads.
- **Page height:** the hero adds `scrollLength` px of scrolling to the page. Set it lower for a shorter animation.
