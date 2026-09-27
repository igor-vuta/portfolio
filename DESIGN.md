# DESIGN.md

The contract for any visual change to this site. `app/globals.css` is the source of truth for values and the reasoning behind them; this file is the short version, plus the rules that live outside CSS. If the two disagree, fix one of them before shipping.

Agents and design skills: these rules override generic advice. Don't swap the typeface, add grain, round the corners or introduce a second accent because a checklist suggests it.

## Concept

The page is a dive. Reading down goes Surface (the stage) → Shallows (Intelli-Factory) → The current (projects) → Logbook (experience) → Seabed (contact). Content floats on dark water with light moving through it. Anything new has to belong somewhere on that descent.

## Tokens

All tokens are defined in `@theme` in `app/globals.css`. Nothing raw in JSX: no hex, no ad-hoc radius, no one-off duration.

| Group | Values | Rule |
| --- | --- | --- |
| Surfaces | `ground` #0a171c, `panel` #11232a, `well` #0d1c22, `coal` #071116 | One cool family. A panel never sits on a panel. Panels are opaque (no backdrop-filter). |
| Ink | `ink` #e6eeee, `fog` #8fa6ab, `mute` #5d7378 | `fog` is the minimum for anything meaningful; `mute` fails AA and is for `aria-hidden` decoration only. |
| Accent | `clay` #e38f6c, `clay-soft`, `clay-wash`; `lamp` #5cc49a for live status | The only warm colour. It marks state and wayfinding, never decoration. |
| Lines | `line`, `line-2` | Two hairline weights only. Separation comes from hairlines, not ornament. |
| Type | IBM Plex Sans (prose), IBM Plex Mono (anything measurable: labels, numbers, units, IDs) | Seven sizes, from `display-xl` down to `tag`. Display tracking is -0.03em. Body is 15px. |
| Geometry | `radius-panel` 3px, `radius-control` 2px | Squared, milled edges. No pills. |
| Spacing | base 0.25rem; steps 1 2 3 4 6 8 12 16 20 24 | Anything off the scale is a mistake. |
| Motion | `ease-entrance` (expo-out), `ease-sharp`; 120 / 160 / 300ms | Nothing overshoots. |
| Elevation | `shadow-panel`, `shadow-raised`, `shadow-well` | Shadows are tinted to deep water, never black. |

## Hard limits

- **Four runtime dependencies**: `next`, `react`, `react-dom`, and `three` for the stage tablet only (owner decision, 2026-09-27: realism over the old no-library rule). three.js is imported on demand and never counts toward the first load. No UI, animation or icon libraries.
- **Static export** to GitHub Pages under `/portfolio`. No server, no runtime API.
- **Real captures only.** Every device screen and project card is a screenshot of the deployed thing (desktop and phone), never drawn UI. Every figure printed is true of this build.
- **Illustrations are setting, not work.** The chapter plates (`app/illustrations/`, generated line art of neurons turning into software, echoing the caustic light behind the page) are decoration: `aria-hidden`, drawn on the ground colour and blended with `lighten`, never used where a capture belongs.
- **Motion is decoration and must never gate content.** Scroll-driven effects use CSS scroll timelines with literal keyframes, running on the compositor, with no script per frame. Two exceptions, both off under reduced motion: the WebGL stage tablet, which renders per frame only while the stage is on screen (the CSS stage underneath stays the design everywhere it does not run), and the synapse layer, a 2D canvas that draws only while something is lit or travelling.
- **Fallbacks are designs, not failures.** Without scroll timelines (Firefox) and under `prefers-reduced-motion`, the page shows a finished still composition. The boot plays once per session, always ends, and never plays under reduced motion.
- **Conditions are first-class**: forced-colors, no-JS, print and coarse input each have rules in `globals.css` §7.

## Accessibility floor

- Text contrast AA or better on every surface. Ratios are listed next to each token.
- Every control has hover, focus-visible, active and disabled states (`globals.css` §5).
- Decorative instruments (gauge, rays, abyss, progress) are `aria-hidden`.

## Verifying a change

Capture before and after with `playwright-cli` for every route (`/`, `/intelli-factory/`, `/projects/`, `/experience/`) at 375, 820 and 1440 wide; with motion on and reduced; in Chromium and Firefox. Any difference that wasn't intended is a regression.
