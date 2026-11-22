# KittyLotus Studio v0.17 · Skin Lab Drawer & Named Native Skins

KittyLotus Studio is a browser-local, no-build narrative preset workbench. It runs as static HTML/CSS/JavaScript and can be published to GitHub Pages. The provided Lumiverse, SillyTavern and Janitor sources are bundled in `data/native/`, with no cloud account or automatic upload.

## v0.15 · Dock → actors → routes, in the original renderer

The CYOA Multi demonstration now starts at the **original native decision dock**, not a forced-open modal. Clicking the dock opens the original popover's **actor-selection map**. Selecting Gabrielle or Zephyr opens that character's three route choices; the native **Other actors** control goes back to the selection map, and Close dismisses the popover. All of these steps use the browser's declarative `popover` and `<details>` behavior with scripts disabled. Reopening remembers which actor was expanded most recently; use **Other actors** to return to the map.

The bundled scene now uses the native CYOA route tags `risk`, `reveal`, `assist`, `tactical`, `protect`, and `social`, so the **actual source-defined SVG icon masks and accent colors** appear instead of empty fallback squares. The choice descriptions and the six Gabi/Zephyr scene actions are retained. The browser showcase still runs the same three original source regexes, pinned to their exact fingerprints, and only replaces the 32-digit generated popover ID. No original regex, canonical native JSON, or route submission behavior was modified. Host route commands remain disabled in the sandbox.

The preview has additional height for the native actor map and full branch screen, including responsive mobile sizing. The native CYOA sky art keeps its original GitHub image URL: the sandbox permits that **image only** alongside weather images, but it will be absent if the image host is unavailable. No scripts or network requests are enabled by the preview.

**Verification:** 74 Node tests passed. Chromium with separately loaded ES modules exercised dock opening, both actor screens, the return-to-selection control, all six SVG route masks, closing, and responsive mobile presentation. The site is still static and GitHub Pages compatible. Deploy the full overlay at your site's repository root and hard-refresh after the release to avoid old cached modules.

## v0.14 · Verified three-stage CYOA and scene fixtures

This is a focused follow-up, not a gallery redesign. The smaller curated gallery already changed in v0.13; if it still looks like the old tracker/social gallery, your browser is serving cached site files. Hard-refresh after deploying this full cumulative overlay.

**CYOA Multi now traces all three original native rules**: Modal, Popover ID, and Popover Wiring. The fixed preview performs a *strictly scoped* replacement of Lumiverse's 32-character random-ID host macro in the generated CYOA marker between the second and third regex. That enables the real popover wiring to match in a browser-only preview; no arbitrary macros or host actions are executed. The preview still opens the native chooser statically for inspection. Both the 32-character ID and every native regex are source verified.

The complete tracker fixture, campaign examples, social presentations (including Twitch), and Skin Lab's demo Motive Ledger now use Gabi, Zephyr, Kitty, and the diagnostic-bay/corridor-containment scene instead of Mara/archivist placeholders. The original protected contract fixtures remain unchanged and are verified separately. One tracker severity was restored to a value the actual regex accepts, returning the full demonstration to **17 matching rules**. All 13 small-gallery HTML snapshots were regenerated against the native scripts after updating the user-facing prose. No canonical preset, script, or artwork was modified.

`npm test`: **73 passing tests**. Dedicated real-ESM Chromium gallery verification passed for the wired three-stage CYOA, five social variants, tracker, small-gallery samples and responsive layout. An older broad browser smoke hung in the sandbox and is not reported as a pass.

## v0.13 · A scene through the rendering pipeline

The upper gallery now has **five presentation slots**: Omni Tracker, illustrated Weather Studio (six real weather variations), campaign console, **Social worlds** (Twitter, Tumblr, Instagram, Twitch, iMessage, one card with five real pipelines), and **CYOA Multi** (a two-character branching scene). The five social variants retain their exact original regex sequences and full site/phone shells. The former Discord full demonstration is no longer a top-level gallery slot, but its original regexes remain in the complete native catalog.

The redundant **Live Render / original replacement HTML** title and description row is gone. Fullscreen lives on the stage toolbar, giving the presentation more vertical room. CYOA Multi renders its *original native branch HTML* with a **preview-only expanded popover** so the route choices are visible despite the absent Lumiverse host macro/runtime; it does not submit choices. Every item retains exact pattern and replacement fingerprint checks, original source tracing, and copyable Gabi-authored source packets.

The lower curated gallery focuses on the supplied **Gabrielle, Kitty, and Zephyr bridge-containment scene** rather than duplicating the full tracker or socials. The Lumiverse examples now include eight inline text effects in one scene excerpt, four original clickable marginal notes, POV change, a thought cutaway, event+chaos, Gabrielle's muttering box, periodic commentary, and narrative telemetry. The existing slowburn and chapter visual samples remain. Three non-social SillyTavern visual samples also remain. All original regexes, including the full 220 Lumiverse/22 ST catalogs, are still editable in the advanced inspector.

Two Gabi display fixtures have Lumiverse host-variable gating macros that do not execute in a standalone browser. **Only their browser preview** isolates the already-generated UI island so the author can see the result; the source regex, native JSON, fixture packets, and snapshot outputs are not rewritten. The standalone CYOA preview now keeps its original dock and interactive declarative popover, while host submission remains disabled. Scripts and host-only actions remain disabled in the sandbox. The single-regex sample picker now jumps without a long smooth-scroll animation.

Run `npm test` for source checks, and `python tests/v13_showcase_browser_smoke.py` for the real separated-ESM Chromium gallery test (requires Python Playwright and Chromium). The older `tests/showcase_browser_smoke.py` command now invokes the same updated test.

## v0.17 interaction notes

In **Skin Lab**, the current skin's name is editable above Save. Save commits the name and CSS to both native Lumiverse regex mirrors. **Export skin** creates a portable Studio skin JSON whose `skin_name`, `regex_script.name`, and `metadata.skin_label` agree; **Import skin** sits beside it and creates an individually identified, disabled variant in both mirrors. Export the full native preset separately when you want those in-memory edits in Lumiverse JSON. On phones, the renderer stays visible and the **Skin controls** drawer slides in; **Pick element** lets you select an element before opening its controls.

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

### Deployment artifact troubleshooting (v0.17.1)

A failed deploy can report **`Found 0 artifact(s)`** despite the Actions run visibly listing a completed `github-pages` upload. That is a GitHub artifact-indexing/metadata visibility failure, not proof the website files are missing. The workflow now builds/uploads in one job and deploys in a dependent job after confirming exactly one artifact has become visible. If an older run failed in this way, push a new commit or trigger **Run workflow** to obtain a fresh run. Avoid **Re-run all jobs** on an old run because it can create duplicate artifacts under the same run ID. If the new workflow still fails, inspect the `Wait for Pages artifact to become visible` step to distinguish API visibility from a subsequent Pages deployment error.

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


## v0.16: GitHub Pages launch and mobile density

For mobile screens under 700 CSS pixels the Studio is displayed at 92% scale, and at 390px and below at 90%. Source-generated gallery and cascade HTML previews get a separate 90% mobile-only visual scale, **except CYOA**, whose native popover requires unscaled iframe hit testing. These are presentation-only adjustments: regex output, input packets, native preset exports, and desktop CSS remain unchanged. No viewport meta spoofing, and no JavaScript-based scaling of controls.

This release includes a ready-made **GitHub Actions Pages workflow** in `.github/workflows/pages.yml`:

1. Unzip the **contents of `KittyLotus-Studio/`** at the ROOT of the GitHub repository. `index.html` should be beside `.github/`, `css/`, `js/`, `assets/`, and `data/`, not nested in another folder.
2. In GitHub Desktop, **Add an Existing Repository** if this is already a git checkout, or **File → New repository** pointed at the extracted folder. Commit the files and use **Publish repository** / **Push origin** on the `main` branch. If GitHub Desktop creates another root folder, copy the site's contents inside that repository before committing.
3. On GitHub, open **Settings → Pages → Build and deployment → Source: GitHub Actions**. The included workflow checks the JavaScript test suite, stages only public site files, then publishes them on pushes to `main` (or through **Run workflow**).
4. Check the **Actions** tab for the Pages deployment. Open the `github-pages` environment URL shown on the completed run. This works under `https://USERNAME.github.io/REPOSITORY/` because every shipped site asset is relative to the current path.

The deployed artifact includes `index.html`, `.nojekyll`, `css/`, `js/`, `assets/`, and `data/`. It excludes tests, scripts, release manifests, and changelogs. All bundled native presets, fixture content, and Gabi images in the `data/` and `assets/` folders **will be publicly accessible** on a public Pages site. Review those assets before publishing. Edits made in a visitor's browser do not automatically commit back to GitHub; users should export their modified presets locally.

To preflight a deployment without GitHub: `npm test` followed by `node scripts/stage-pages.mjs`. The generated `dist-pages/` directory is ignored by git.
