# crootjs/docs — Project Instructions

This repo holds the per-module documentation for [CrootJS](https://github.com/crootjs/lib), published at https://croot.js.org/docs/.

## Mandatory conventions

Any HTML/CSS/JS example embedded in these docs must follow CrootJS's coding conventions: HTML, CSS, and JS in separate files; no inline `<style>`/`<script>` blocks; no `onclick`/`style=""` attributes; JS loaded as `<script type="module">`. Full rules: [conventions.md](conventions.md).

## When writing or editing a module doc page

- Verify function signatures and behavior against the actual source in `crootjs/lib` before documenting them — don't describe what a function "should" do, describe what it does.
- Every code example must import from a real, pinned CDN version tag (`https://cdn.jsdelivr.net/gh/crootjs/lib@<version>/<module>.js`), never `@latest`.
- Link new pages from `README.md`'s "Referensi Modul" list — an undiscoverable doc page is as good as missing.
