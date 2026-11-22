# KittyLotus Studio v0.13 · Scene-Driven Regex Theater

KittyLotus Studio is a browser-local, no-build narrative preset workbench. It runs as static HTML/CSS/JavaScript and can be published to GitHub Pages. The provided Lumiverse, SillyTavern and Janitor sources are bundled in `data/native/`, with no cloud account or automatic upload.

## v0.13 · A scene through the rendering pipeline

The upper gallery now has **five presentation slots**: Omni Tracker, illustrated Weather Studio (six real weather variations), campaign console, **Social worlds** (Twitter, Tumblr, Instagram, Twitch, iMessage, one card with five real pipelines), and **CYOA Multi** (a two-character branching scene). The five social variants retain their exact original regex sequences and full site/phone shells. The former Discord full demonstration is no longer a top-level gallery slot, but its original regexes remain in the complete native catalog.

The redundant **Live Render / original replacement HTML** title and description row is gone. Fullscreen lives on the stage toolbar, giving the presentation more vertical room. CYOA Multi renders its *original native branch HTML* with a **preview-only expanded popover** so the route choices are visible despite the absent Lumiverse host macro/runtime; it does not submit choices. Every item retains exact pattern and replacement fingerprint checks, original source tracing, and copyable Gabi-authored source packets.

The lower curated gallery focuses on the supplied **Gabrielle, Kitty, and Zephyr bridge-containment scene** rather than duplicating the full tracker or socials. The Lumiverse examples now include eight inline text effects in one scene excerpt, four original clickable marginal notes, POV change, a thought cutaway, event+chaos, Gabrielle's muttering box, periodic commentary, and narrative telemetry. The existing slowburn and chapter visual samples remain. Three non-social SillyTavern visual samples also remain. All original regexes, including the full 220 Lumiverse/22 ST catalogs, are still editable in the advanced inspector.

Two Gabi display fixtures have Lumiverse host-variable gating macros that do not execute in a standalone browser. **Only their browser preview** isolates the already-generated UI island so the author can see the result; the source regex, native JSON, fixture packets, and snapshot outputs are not rewritten. The standalone CYOA preview similarly reveals the original popover statically. Scripts and host-only actions remain disabled in the sandbox. The single-regex sample picker now jumps without a long smooth-scroll animation.

Run `npm test` for source checks, and `python tests/v13_showcase_browser_smoke.py` for the real separated-ESM Chromium gallery test (requires Python Playwright and Chromium). The older `tests/showcase_browser_smoke.py` command now invokes the same updated test.

## What's included

- **Preset Architect:** native preset editor with a narrower canvas and Constellation Workshop-style hierarchy. The contextual second rail belongs only to Architect, where it navigates real Lumiverse sections, a presentation-only SillyTavern outline, or Janitor's two original prompt choices.
- **Lumiverse:** 117 controls from the source schema, preserving native choices, descriptions, values, and independent section expansion. Native multiselects use accessible selection chips rather than a Ctrl/Cmd-click list, and Boolean options use switch controls. Editing and JSON export retain unrelated data.
- **SillyTavern:** all 311 native prompts, original enable flags and `prompt_order` synchronization. Major groups have one collapsible section; internal Unicode second/third tiers and source boxes are visually indented rather than nested accordions. Content-bearing heading and closing prompts remain editable in their original positions; empty source markers stay reachable through a small optional drawer. Wrapper/subsection/leaf labels are presentation-only: prompt IDs, order, content, enabled state, and JSON layout are unchanged.
- **Janitor:** two straightforward navigation choices, *No impersonation* and *Impersonation + steering*. They load the original complete fixed prompt texts, with direct full-text copy, exact-text download, and no misleading category editor or irrelevant search bar.
- **Skin Lab:** now starts with four relevant frame controls rather than a 27-token scroll maze. Choose a visible Motive area, or enable **Pick from preview** and click an actual element to select its relevant native tokens. The color, transparency, shadow and size controls update the existing iframe DOM in place, preserving native tabs, scroll and editor state. The bounded editor has its own scrollbar, sized like Regex Playground’s sidebar, and is not page-sticky. Save/activate remains accessible within that scroll card. Genuine variables unused by Motive stay under **Other native tokens / advanced**. Round color wells replace rectangular swatches; switches are explicitly sized to prevent vertical flex expansion. Switch between the original **Lumiverse and SillyTavern Motive Ledger** renderer regexes. The preview uses the authentic native HTML replacement and a stable Gabi-annotated packet, not a mocked tracker panel. Lumiverse additionally exposes the selected original dossier skin's complete native `--rxd-*` token inventory (27 in the bundled default), clone/create support, source editing, complete preset export, and **individual skin JSON import/export**. Individual exports retain one exact native regex script record (including unsaved CSS), wrapped in a Studio-portable `kittylotus-dossier-skin` envelope. Import creates a new, disabled, uniquely identified skin in both native Lumiverse regex arrays. This format is intended for Studio-to-Studio transfer; direct host import is not claimed. The Lumiverse skin maker now sits beside the actual Motive Ledger preview. It has explicit color and opacity controls for hex/rgba/gradient and shadow color stops, dimensional sliders for single-value radii, semantic usage labels, advanced original CSS, and a complete native clone → edit → save → activate → export flow. Unused Motive CSS tokens are identified instead of implying a visible change. SillyTavern remains preview-only. Experiment-only renderer CSS stays separate from native dossier changes.
- **Regex Showcase:** a gallery-first visual explorer instead of an intimidating regex debugger. Select Lumiverse or SillyTavern to browse **15 fingerprint-verified rendered HTML samples** (9 Lumiverse / 6 SillyTavern), including actual Motive Ledger, Discord, phone/iMessage, typography, story decoration, status, and chapter replacements. Thumbnails and the large preview are generated from **the original native regex replacement HTML** with exact matching Gabi-annotated fixture packets, not recreated mock components. Each bundled preview is pinned to the native pattern, replacement, and input fingerprints; an edited script loses its verified badge rather than showing stale HTML. Cards are keyboard-accessible and filter by visual family. A secondary searchable source index lists all detected native HTML producers (**156 Lumiverse / 16 SillyTavern** in this snapshot), clearly marking scripts without verified samples. The full original **220/22 regex records** remain editable, including nonvisual transformations, through the collapsed **Advanced · Regex source and test bench**. Pattern/replacement edits, enabled switches, single-script and pipeline test modes, original packet loading, result inspection, and native JSON export are preserved. Source edits do not silently reset the selected inspector. Eight existing contract fixtures remain intact; `data/fixtures/showcase-samples.json` adds ten new verified contracts, and `showcase-snapshots.json` records 15 reproducible original HTML outputs for immediate previews. All previews are sandboxed with script execution disabled; the curated weather presentation permits only the native GitHub image URLs, which require network access. Host behavior is not emulated.
- **Full presentation cascades:** five top-level source-verified presentation slots with 19 Gabi-authored variants, including the original Omni Tracker (17 native matches), six weather presets, campaign progression, five socials in one card, and CYOA Multi. All have exact regex traceability, with host-only actions disabled. The smaller scene-driven gallery beneath them contains ten Lumiverse and three SillyTavern verified examples.
- **Visual hierarchy:** source-matched Constellation standalone style reference tokens `#030305` background, `#07070b` panels, `#0d0b15` controls, `#6548db` accent and `#70ddff` signal. The supplied exact dark reference palette is now applied across the Studio shell, regex surfaces, dashboard, and authoring controls. Native iframe renderers retain their own source-defined CSS, by design. Previously: deeper Constellation-inspired black-violet backgrounds, purple emphasis and more compact typography inspired by the supplied Constellation Workshop screenshot. Skin Lab and Regex Playground no longer waste space on a forced secondary rail. Responsive mobile layouts preserve direct access to editors.
- **Gabrielle Gallery and Lounge:** 15 expression PNGs, five chibis and the complete `assets/gabi/gabi-views.webp` artwork bundled locally. Workspace status uses matching expressions; Gabi Gallery also supports temporary previews.
- **Advanced Source:** optional raw inspector/editor, kept out of the primary workflow. Live GitHub checking is explicit, opt-in, schema-checked and refuses ambiguous file matches.

### Source integrity

`data/native/source-manifest.json` records the input snapshots and their hashes. `BUILD-MANIFEST.json` plus `SHA256SUMS.txt` describe this cumulative source delivery. The source-native fixtures and precomputed gallery snapshots are separate: only original native source bytes establish a renderer contract. All edited controls, regex scripts and skins stay in memory until you export them. An individual skin file is distinct from the full native preset: browser local data is not a GitHub commit.

### Running locally

Extract the archive. On Windows, double-click `start-studio.cmd` with Python installed, then open `http://localhost:4173` in a browser. Alternatively run:

```powershell
py -m http.server 4173
```

Run these commands inside the `KittyLotus-Studio` folder so the site's relative asset and JSON paths resolve. Loading `index.html` directly with `file://` can fail due to browser ES module/fetch restrictions.

### Publishing on GitHub Pages

Keep `index.html` at the repository root alongside `css/`, `js/`, `data/`, `assets/` and `.nojekyll`. Publish `main` / root from GitHub Pages settings. The site uses only relative paths for its shipped assets; no bundler or app server is needed for deployment.

### Tests

```sh
node --test tests/*.test.mjs
python tests/native_browser_smoke.py
python tests/showcase_browser_smoke.py
python tests/esm_browser_smoke.py
python tests/workbench_browser_smoke.py
python tests/skinmaker_browser_smoke.py
python tests/st_outline_browser_smoke.py
python tests/v10_browser_smoke.py
python tests/served_browser_smoke.py
```

JavaScript tests require Node 22+ and have no npm dependencies. Browser tests require Python Playwright and Chromium. The optional served test uses local loopback; some hosted sandboxes block that port, in which case run it on your own PC.

### Known boundaries

Showcase thumbnails, full tracker cascades and weather/campaign/website presentations use their original source regex replacement HTML with illustrative but exact-contract test packets. Not all source regexes have a sample; unsupported entries are explicitly marked and remain editable. They do not establish that every dynamic SVG range, button, nested accordion, host macro or injected command works in Lumiverse itself. Browser regex processing can differ from Lumiverse and SillyTavern. User-created CSS is treated as local test input, and the CSS editor rejects unsafe remote imports/URLs. This tool does not replace host-side validation of final exported packs. The Studio palette comes from the supplied standalone `constellation-style-reference.html`, with its explicit CSS token values; the source CSS of the full Constellation app was not provided.

### ESM browser regression (no localhost server required)

Run `python tests/esm_browser_smoke.py` after changing module imports or SillyTavern grouping. This test creates separate native ES modules in Chromium instead of merging their scopes, preventing missing-import regressions.
