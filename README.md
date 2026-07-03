# Software Expert Systems — Website

A minimalist single-page site with a 3D animated background (Three.js), scroll
animations, and glassmorphism styling.

## Structure

```
ses-website/
├── index.html        # All page content
├── css/style.css     # Styling, animations, responsive rules
├── js/main.js        # Three.js scene + interactions
└── assets/logo.svg   # Placeholder SES logo
```

## Using your real logo & photos

- `assets/logo-official.png` — the exact official logo (white circuit-S on
  navy, 200×200), pulled from the company's LinkedIn profile. Used in the nav,
  footer, and favicon. If you have a higher-resolution or transparent-background
  export, drop it over this file.
- `assets/cover-official.png` — the official LinkedIn cover banner (team
  photo), downloaded and kept in assets but currently unused.
- `assets/logo.svg` — a hand-built vector recreation of the shield mark, kept
  as a scalable fallback (used by the loading-screen outline animation).

Team/office photos can be added to `assets/` and dropped into the About or
Careers sections as `<img>` tags.

## Customizing

- Brand colors live in the `:root` block at the top of `css/style.css`
  (`--cyan`, `--violet`, `--magenta`). Change them once and the whole site
  (including gradients) follows.
- The 3D scene (star count, colors, rotation speeds) is configured at the top
  of the `initScene` function in `js/main.js`.

## Running locally

Any static file server works, e.g. `npx serve ses-website` or
`python -m http.server` from inside the folder. Opening `index.html` directly
in a browser also works (fonts and Three.js load from CDNs).

## Deploying

The site is fully static — drag the folder into Netlify, Vercel, GitHub Pages,
or any web host.
