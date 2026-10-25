# NYXORAVEX — ONE COSMOS. INFINITE IDENTITIES.

An endless, deterministic profile universe. Plain HTML/CSS/JS, no backend, no build step.

## Deploy to GitHub Pages
1. Push `index.html`, `style.css`, `script.js`, `README.md` to a repository.
2. Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. Open the published URL. Profiles can be linked as `?profile=<any positive integer>`.
Any static host (Netlify, Cloudflare Pages, etc.) works the same way.

## How it works
- **Identity**: the exact decimal string is hashed (never converted to `Number`) to seed a PRNG that derives name, class, origin, colors, symbol, attributes and SVG avatar. Same number → same profile on every device.
- **IDs**: validated as `^\d+$`, leading zeros stripped (and reported), zero rejected. Previous/next use string increment/decrement; the feed uses `BigInt` counters.
- **Feed**: fixed-height cards in a window of roughly 30–60 DOM nodes, extended in both directions. Trimmed cards are replaced by padding so scroll position holds. Triggers: `IntersectionObserver`, passive scroll, resize/orientation, and a 1.2 s recovery timer, all feeding one rAF-throttled `step()`.
- **Settings**: animations, compact cards, accent color (saved in `localStorage` if available).
- Note: the PRNG seed is 32 bits, so two distant profiles may occasionally share a name or look. Their numbers are always unique.
