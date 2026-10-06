# career.landisland.blog

Liam's career site: timeline, resume, and writing. Built with [Astro](https://astro.build) on top of the [Astro Nano](https://github.com/markhorn-dev/astro-nano) theme (MIT, see `LICENSE-astro-nano`), deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Where to edit

| What | File |
|---|---|
| Timeline, resume entries, education | `src/data/timeline.ts` (set `current: true` for the green dot) |
| Home page intro | `src/pages/index.astro` |
| Articles | `src/content/blog/<slug>/index.md` or `index.mdx` (`draft: true` hides a post on the live site; drafts still show in `npm run dev`) |
| Site name, links | `src/consts.ts` |
| Interactive 3D model and essay figures | `public/systems/` (model page at `/systems/model/`, figures in `figures/`); essay components in `src/components/systems/` |
| Resume PDF | put it at `public/resume.pdf`, then set `HAS_PDF = true` in `src/pages/resume.astro` |

## Local preview

```sh
npm install
npm run dev
```
