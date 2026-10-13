# Graph Report - casstelle-checkin  (2026-10-12)

## Corpus Check
- 35 files · ~33,880 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .cache 1, .rules 1)

## Summary
- 244 nodes · 465 edges · 18 communities (11 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `57097ccc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- workbox-f1770938.js
- package.json
- page.tsx
- a
- compilerOptions
- v
- manifest.json
- devDependencies
- layout.tsx
- PolaroidWall.tsx
- delete-note.mjs
- README.md
- AGENTS.md
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `s` - 19 edges
2. `a` - 18 edges
3. `compilerOptions` - 16 edges
4. `v` - 15 edges
5. `z()` - 15 edges
6. `useAuth()` - 15 edges
7. `react` - 14 edges
8. `lucide-react` - 12 edges
9. `r` - 12 edges
10. `Home()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Home()` --calls--> `LetterOverlay()`  [EXTRACTED]
  src/app/page.tsx → src/components/LetterOverlay.tsx
- `RootLayout()` --calls--> `ClientProviders()`  [EXTRACTED]
  src/app/layout.tsx → src/components/ClientProviders.tsx
- `Home()` --calls--> `ApologyLetter()`  [EXTRACTED]
  src/app/page.tsx → src/components/ApologyLetter.tsx
- `Home()` --calls--> `DailyMoodCheck()`  [EXTRACTED]
  src/app/page.tsx → src/components/DailyMoodCheck.tsx
- `Home()` --calls--> `Interactions()`  [EXTRACTED]
  src/app/page.tsx → src/components/Interactions.tsx

## Import Cycles
- None detected.

## Communities (18 total, 7 thin omitted)

### Community 0 - "workbox-f1770938.js"
Cohesion: 0.08
Nodes (19): b(), constructor(), deleteCacheAndMetadata(), et, F, G, get(), h() (+11 more)

### Community 1 - "package.json"
Cohesion: 0.05
Nodes (37): eslintConfig, nextConfig, pwaOptions, withPWA, dependencies, @ducanh2912/next-pwa, firebase, framer-motion (+29 more)

### Community 2 - "page.tsx"
Cohesion: 0.16
Nodes (27): firebase, lucide-react, react, CheckIn, Home(), ApologyLetter(), DailyMoodCheck(), moodsConfig (+19 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 5 - "v"
Cohesion: 0.28
Nodes (4): m(), st(), U(), v

### Community 6 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 7 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+1 more)

### Community 8 - "layout.tsx"
Cohesion: 0.31
Nodes (6): metadata, outfit, RootLayout(), viewport, ClientProviders(), AuthProvider()

### Community 9 - "PolaroidWall.tsx"
Cohesion: 0.32
Nodes (6): LetterOverlay(), caveat, INITIAL_CARDS, PolaroidCardData, PolaroidWall(), PolaroidWallProps

### Community 10 - "delete-note.mjs"
Cohesion: 0.40
Nodes (3): app, db, firebaseConfig

### Community 12 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **88 isolated node(s):** `firebaseConfig`, `app`, `db`, `eslintConfig`, `pwaOptions` (+83 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 113 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `firebase` connect `page.tsx` to `package.json`, `delete-note.mjs`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `react` connect `page.tsx` to `package.json`, `PolaroidWall.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `next` connect `package.json` to `layout.tsx`, `PolaroidWall.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `firebaseConfig`, `app`, `db` to the rest of the system?**
  _88 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `workbox-f1770938.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08244680851063829 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.054878048780487805 - nodes in this community are weakly interconnected._
- **Should `a` be split into smaller, more focused modules?**
  _Cohesion score 0.1422924901185771 - nodes in this community are weakly interconnected._