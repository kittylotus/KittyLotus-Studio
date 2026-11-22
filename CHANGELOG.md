## v0.17.1 · GitHub Pages artifact visibility hotfix (2026-11-22)

- Split the Pages workflow into a `build` job (tests, staging, upload) and a dependent `deploy` job, so deployment never races the upload step on the same runner.
- Wait for exactly one visible `github-pages` artifact through the GitHub Actions API before deployment; the deploy job has explicit `actions: read` permission. If artifact indexing stalls, the workflow fails clearly without re-uploading.
- Queue concurrent Pages releases instead of cancelling an in-flight upload; use the current Pages artifact uploader v4.
- No application JavaScript, CSS, HTML, native presets, fixtures or Gabi artwork changed. This is a deployment-only hotfix.
- To retry the previous failed upload, **push this new workflow commit** or use **Actions → Publish KittyLotus Studio → Run workflow**, not “Re-run all jobs” on the old run (which can duplicate `github-pages` artifacts).

## v0.17.0 · Native skin names + one-surface mobile editor (2026-11-22)

- Overview eyebrow now reads **The screen's control panel**, with **Prep the scene, Teammate.** as the main heading, without gradient-highlighted typography.
- Skin Lab has an editable current skin name next to its Save action. Saving validates and synchronizes the native regex name, label metadata, and CSS in both mirrors. Individual exports include that name and the latest CSS; import and export are paired in the visible toolbar, with persistent error feedback.
- Phones show the live Motive Ledger as the primary surface. A slide-in side drawer holds the palette, geometry, sliders, and skin management. The preview picker closes the drawer to let you choose an element, then reopens the relevant controls.
- Native sources, Gabi art, and original regexes remain unchanged in the bundled snapshots.

## v0.16.0 · GitHub Pages release candidate (2026-11-22)

- Mobile-only compact layout: 92% Studio scale at ≤700px, 90% at ≤390px. Desktop remains unchanged.
- Mobile-only 90% native regex iframe scale in the full-presentation and sample gallery, excluding native CYOA popovers to preserve dock click geometry; source HTML is not altered.
- Add GitHub Pages Actions deployment that runs JavaScript checks and publishes only runtime assets under the repository subpath.
- Keep `.nojekyll`, mobile density and static resource integrity tested; preserve original native data and artwork.

# KittyLotus Studio v0.15 · Interactive Native CYOA Dock

- Restores the real original **dock → actor selection → individual character routes** flow in the source-verified CYOA Multi showcase; removes the v0.14 preview-only force-open modal adapter.
- The native declarative popover, close button, and `<details>` actor navigation work without injected JavaScript. Source rules and host-only send actions are unchanged; the verified random-ID shim remains scoped to the curated CYOA fixture.
- Changes the six sample route tag identifiers to source-supported **risk, reveal, assist, tactical, protect, social** so the CSS data-URI SVG masks render correctly, retaining the Gabrielle–Zephyr–Kitty scene decisions and descriptions.
- Enlarges the native CYOA stage for its full actor map and branch panels, including mobile; allows its original GitHub sky artwork under the restricted image CSP (may not load offline).
- Adds a source vocabulary regression and browser interaction checks for dock, both actors, route icon masks, map return, close, and mobile. **74/74 Node tests passed; dedicated separate-ESM Chromium browser smoke passed.**
- Canonical Lumiverse, SillyTavern and Janitor preset sources, protected contract fixtures, original gallery snapshots and artwork were not changed. Full cumulative static-site overlay remains ready for GitHub Pages.

# KittyLotus Studio v0.14 · CYOA Dependencies & Gabi Scenario Cleanup

- Verifies the complete original CYOA Multi chain, **Modal → Popover ID → Popover Wiring**, instead of stopping after the Modal. Exactly fingerprints all three canonical native scripts. A single deterministic 32-digit host ID is inserted only into the CYOA popover marker in the curated sandbox between stages; unrelated regex previews and host macros are untouched. No host submissions or runtime actions are enabled.
- Replaces legacy Mara, archivist, library-index, and generic Twitch gallery scenarios with Gabrielle, Zephyr, Kitty, and the diagnostic-bay containment scene. Updates the tracker, campaign, five social packets, and Skin Lab's Motive Ledger example without changing canonical regexes, native preset files, or protected contract fixtures.
- Repairs one tracker fixture severity to match the native regex vocabulary, restoring the **17 original matched transformations**. Regenerates all 13 small-gallery source-derived HTML snapshots and fingerprints for their revised packets.
- Adds dependency, opt-in macro-substitution, stale-name, and source-contract regressions. **73/73 Node tests and targeted real-ESM Chromium showcase smoke passed.** The older broad native-browser suite hung in this environment and is not counted.
- Confirms the already-correct v0.13 tiny-gallery replacement need not be rewritten; an old gallery screenshot was caused by browser caching. Hard refresh following deployment if older assets remain visible.

# KittyLotus Studio v0.13 · Scene-Driven Regex Theater

- Consolidates classic Twitter, Tumblr, Instagram, Twitch, and a new full native iMessage phone-shell cascade into **one Social worlds card** with five distinct native source plans. Removes Discord from the top gallery, not the source catalog.
- Adds **CYOA Multi** as a full presentation, with Gabrielle and Zephyr's two-actor/six-route decision scene. The native CYOA popover is statically opened only in the browser preview; no host submission is performed.
- Removes the large redundant live-render title/description row and relocates fullscreen to the preview stage bar.
- Replaces the lower tracker/social samples with the supplied bridge-containment scene: 8 native inline effects; 4 real marginal note popovers; POV change; thought reveal; event+chaos; Gabrielle muttering; periodic commentary; and monitor telemetry, alongside chapter/slowburn samples. Keeps 3 non-social ST examples.
- Source-verified multi-rule samples are contract-pinned to every original regex in their pipeline. Only source-generated HTML qualifies for preview; native JSON data remains unchanged.
- Hides Lumiverse-only host gating text solely inside the two affected Gabi browser previews, not in regex source/output. Removes smooth-scroll card selection to reduce missed pointer clicks.
- Adds focused cascade and source-fingerprint regressions and updated separate-ESM Chromium browser smoke; `npm test` passes 71 tests.

# KittyLotus Studio v0.12 · Complete Native Presentation Cascades

- Adds a **full native regex cascade gallery** above the existing one-script visual showcase: eight complete presentations and eighteen Gabi-authored packet variants, all exercised against the original Lumiverse regex patterns/replacements, without mocked presentation HTML.
- Presents the full eight-module Omni Tracker as a real transformation sequence: 17 native rules matched, one rule skipped, ~154 KB of source HTML and a working native Expand Matrix popover. Curated, fingerprint-pinned demos use a bounded 260 KB output cap, leaving the ordinary 150 KB diagnostic guard unchanged.
- Adds six original weather variants through the real two-stage resolver → illustrated header cascade. The weather-stage viewport is compact rather than an empty full-page panel. Photos still use the preset’s remote URLs and therefore may be unavailable offline; no substitute images are claimed.
- Adds four campaign variants including Gabrielle’s character sheet, earned milestone ribbons and an unspent attribute boost, plus five full social/website cascades: Discord, Twitch, Instagram, classic Twitter-like timeline and Tumblr.
- Places the actual matched/skipped regex trace beside the sandboxed rendered output, with direct source-inspector links and copyable original-contract Gabi packets. Every script is fingerprint-verified; modified source invalidates a curated demo rather than silently displaying an unrelated render.
- Keeps the original 15 independent samples, both native regex catalogs, full advanced editor, Skin Lab and Preset Architect intact. Adds six source-driven regression tests and dedicated real-ESM browser coverage for the tracker, host-safe popover, weather, campaign, Discord and responsive layout.
- Native preset data and Gabrielle assets remain byte-for-byte unchanged.

# KittyLotus Studio v0.11 · Native Regex Showcase

- Replaces Regex Playground’s default forensic-workbench landing view with a visual sample gallery. Real Lumiverse/SillyTavern HTML replacements appear as category-filtered thumbnail cards, and clicking one opens a larger native output preview. Source changes are not simulated or given invented visual examples.
- Ships 15 stable, contract-tested Gabi example packets (9 Lumiverse / 6 SillyTavern) and 15 immediate HTML snapshots, verified against the bundled native regex pattern, replacement, and input fingerprints. Stale edits invalidate sample verification.
- Includes a searchable index of all visually classifiable source replacements (156 Lumiverse / 16 SillyTavern in this snapshot), clearly marking entries without verified previews. All 220 Lumiverse and 22 SillyTavern regex records remain available and editable in the collapsible advanced source inspector and test bench.
- Preserves the original pattern, replacement, enabled flags, pipeline tests, source export, and eight existing contract fixtures. Saving a native regex no longer causes the gallery to replace the selected source editor.
- Applies the supplied Constellation near-black/violet styling to the gallery. Uses accessible card buttons and responsive mobile layouts with sandboxed preview iframes that disable scripts, networking, and host interactions.
- Adds a standalone real-ESM Chromium showcase regression suite and native transform fingerprint tests; updates existing smoke tests to explicitly open the intentionally collapsed workbench. Original native presets and bundled artwork are unchanged.

# KittyLotus Studio v0.10.1 · SillyTavern Hierarchy Runtime Fix

- Fixes the missing `stPresentationLabel` ES module import in `js/app.js`, which crashed ST section rendering immediately after the category heading and left a blank panel. The original native preset and the 311 prompts are unchanged.
- Adds a browser regression harness that preserves real ES module boundaries using separate Blob modules. The previous browser harness concatenated module source into one scope, hiding missing imports.
- Checks all 17 SillyTavern groups, Text Addons editing, and Janitor → ST navigation on actual Chromium ESM execution. Adds a Node import-contract regression to the default test suite.

# KittyLotus Studio v0.10 · Portable Skin Export, Stable Scroll, Native ST Hierarchy

- Exports **one complete Lumiverse dossier skin regex record** as Studio-portable JSON, including unsaved CSS edits without mutating the native preset. Imports the same file as a disabled skin with a fresh ID, collision-safe name and unique `metadata.skin_id` in **both** native regex mirrors. The original skin and all other regexes stay intact.
- Matches Skin Lab's bounded editor scroll height to the Regex Playground picker (~807px at a 900px desktop viewport). The editor itself is no longer viewport-sticky. Save/activate remains pinned **inside** its scroll card.
- Converts the click-to-pick action into a compact crosshair SVG, preserving its button label and keyboard accessibility.
- Overrides residual navy/blue gradients throughout Studio chrome with the exact Constellation reference palette; original Lumiverse and ST sandboxed HTML replacements are not recolored behind the native source's back.
- Janitor hides native control/content search entirely, and offers **Copy prompt** for the whole selected original master text alongside unchanged download.
- SillyTavern presents one collapsible major section, then clear source-derived second/third tiers. Source boxes (`┌─ ... ╰──────`, including the Image Gen governor terminator) stay visibly grouped, and standalone `┆✧` entries remain level two. Content-bearing structural prompts are editable in place; empty markers are accessible in an optional non-accordion drawer. Original 311 prompts, IDs, order, flags and text remain unchanged.
- Adds source tests for single-skin import/export, safe failures and Unicode hierarchy, plus Chromium browser checks for picker SVG, scroll geometry, native mirror round-trip, Janitor clipboard and ST source boxes.

# KittyLotus Studio v0.9 · Targeted Skin Lab, Stable Preview

- Uses the supplied standalone Constellation style reference's exact background, panel, control, accent, cyan signal and border tokens instead of guessing from screenshots.
- Adds a **What are you styling?** picker with source-derived Motive areas; only actual renderer-referenced CSS declarations appear in ordinary choices. Other native declarations remain in an advanced bucket and are never deleted.
- Adds **Pick from preview**: click a Motive header, tab, card or text element and jump to the related native CSS controls. No artificial overlay substitutes for the real renderer.
- Applies color, opacity, radius and preview CSS edits to the **existing sandboxed Motive DOM** rather than repeatedly navigating its iframe. Native tab selection and scroll position survive edits. The sandbox still forbids scripts and remote assets.
- Saves CSS updates without rebuilding the controls. Adds a compact sticky **Save / Use in preset** strip that maintains operator scroll position.
- Defaults to a four-token frame editor instead of showing every declaration, reduces editor vertical padding, and makes swatches round.
- Fixes vertical flex expansion that was making CSS switches 37×37 instead of 37×21.
- Includes source-driven area mapping tests and browser tests for no iframe reload, real DOM picker, scroll preservation, palette, toggle and swatch geometry.
- All bundled native presets, fixture contracts and Gabi assets remain unchanged.

# KittyLotus Studio v0.8 · Source-Backed Skin Maker

- Moves the complete native Lumiverse dossier editor beside the original Motive Ledger HTML preview, with collapsible sections and a scrollable palette column.
- Adds real hexadecimal and rgba color pickers, gradient/shadow stop colors, opacity sliders, dimensional sliders, semantic purpose labels and per-variable renderer usage counts. Original nontrivial CSS always remains editable.
- Previews unsaved native dossier CSS through the **original** `RX_DOSSIER_SKIN` insertion marker, without inventing HTML. `Save skin` writes both regex mirrors; `Use in preset` activates the selected variant; native export preserves unrelated fields.
- Marks native tokens not referenced by Motive Ledger explicitly. Those values still save for other host-side uses.
- Replaces the Lumiverse Ctrl/Cmd-click multiselect with accessible option chips, and all bare native prompt/regex Boolean checkboxes with CSS switches.
- Deepens the charcoal-violet Constellation hierarchy, reducing remaining navy surfaces. The supplied reference HTML lacks its linked stylesheets, so palette tokens were reconstructed locally rather than imported.
- Adds grammar, source mirror and real browser interaction regression coverage, including changes to the rendered iframe computed CSS. No bundled native JSON or Gabi artwork was edited.

# KittyLotus Studio v0.7 · Workshop UX and Gabi Fixtures

- Reworks Preset Architect hierarchy and width to follow Constellation Workshop; the second navigation rail only appears where it genuinely navigates preset sections.
- Simplifies Janitor to its two real master prompts and makes SillyTavern's 311 entries easier to navigate without changing the source order, prompt IDs, or native JSON format.
- Adds a fixed, authentic Motive Ledger preview for both Lumiverse and SillyTavern, using their respective original HTML-producing regexes and an annotated native Gabi test packet.
- Separates Lumiverse-only dossier skin creation from Motive Ledger preview styling, and surfaces all 27 original default dossier CSS custom properties for direct editing. Native updates are mirrored in both regex arrays.
- Makes the Regex Playground default to scripts with actual HTML replacements; text/metadata rules remain accessible under Show all scripts.
- Adds cross-platform Gabi Motive Ledger fixtures (eight pinned fixtures total), mocked null/desync and CSS round-trip tests, and updates browser smoke coverage.
- Moves the site to darker black-purple surfaces and keeps non-Architect workspaces free of a redundant inner sidebar.
- Preserves every bundled native source and Gabrielle illustration in the full cumulative editable site, with updated SHA-256 build inventory.

# KittyLotus Studio v0.6 · Native Tracker Workbench & Hierarchical ST

- Replaces illustrative Skin Lab cards with previews rendered from the native Lumiverse OMNI TRACKER regex shell and selected dossier skins.
- Adds native dossier-skin cloning and editable scoped CSS/style controls, while preserving both Lumiverse regex mirrors.
- Makes Preset Architect compact and editor-first, with real SillyTavern prompt text, toggles, and a three-level source-derived outline. All 311 original prompts are preserved, including six not in prompt_order.
- Converts the Janitor prompt into an exact native variant picker.
- Adds the actual Lumiverse/SillyTavern regex editors, a platform selector, real regex folder selection, sandboxed output previews, and fixture testing.
- Retires Source Editor from main navigation, leaving an Advanced Source inspector.
- Bundles Gabi-Views artwork for the lounge and workspace-specific Gabi expressions for the sidebar.
- Adds source-preservation, ST hierarchy, regex/skin regressions, and browser smoke coverage.

# KittyLotus Studio v0.5 · Schema Integration

- Adds imported native Lumiverse schema browser with 117 editable controls and faithful JSON exports.
- Bundles the supplied Lumiverse, SillyTavern and Janitor source snapshots with SHA-256 provenance manifest.
- Includes 15 user-provided Gabrielle expression PNGs and five chibis, all local.
- Adds opt-in GitHub main sync with ambiguous file refusal, format validation and regex fixture drift warnings.
- Adds six exact-name, fingerprint-pinned native regex fixtures and tests.
- Allows exclusive selection of eight real dossier regex skins across mirrored Lumiverse script arrays.
- Corrects select value/UUID preservation in native control edits (including mixed IDs and values).
- Adds full lounge art `assets/gabi/lounge-full.png` override and one-session Gabi Gallery image preview.
- Keeps concept controls separate from native controls; host rendering remains approximate.
- Retains Constellation-style design, SVG-only UI icons, dashboard height and dock fixes.

# KittyLotus Studio v0.4 · Stable Lounge

- Kept the full six-card dashboard grid footprint when filtering All/Engine/Visual/Extras, including narrow mobile. Hidden cards do not receive pointer events or keyboard focus.
- Anchored the sidebar Gabrielle portrait dock against the bottom edge of the navigation rail, removing the empty gap.
- Added browser geometry and source regressions for these changes.
- No modifications to editors, exports, preset data, artwork, or JavaScript behavior.

# Changelog

## v0.3 · Lounge dashboard and nightshift palette

- Rebuilt Overview as a functional Constellation Views-inspired workspace, including an illustrated lounge and filterable actual tool launches.
- Live status for platform, source, source changes, regex pipeline, conceptual skins, and planning profile.
- Added direct import and profile export actions from Overview.
- Gave Overview the entire content width by hiding redundant secondary navigation there.
- Updated full-app accent palette to cyan, blue-violet, purple-to-cyan gradients, and near-black foundations.
- Bundled temporary Gabrielle lounge art cropped from the user-supplied screenshot; ready to replace with original asset.
- Kept SVG-only UI icon policy, added dashboard tests, and preserved existing tools.

# KittyLotus Studio changelog

## v0.2.0 · Constellation-inspired UI migration

- Replaced the oversized hero/cards with a compact, grouped overview and contextual second navigation rail.
- Converted primary navigation, secondary controls, import/export buttons, tool controls, headings, and dynamically generated module rows from glyph characters to an inline SVG icon registry.
- Added a responsive Gabrielle dock at the bottom of the main rail, with a local portrait slot, verified public repository fallback, and clean placeholder behavior when artwork cannot be loaded.
- Added local-first expression resolution with optional public-source fallback and missing-art placeholders.
- Preserved Preset Architect, Source Editor, Skin Lab, Regex Playground, Gabi Gallery, and Studio profile handling.
- Added an offline browser smoke fixture which exercises all six workspaces, module selection, the skin controls, a demo regex pack, and the mobile drawer.
- Added independent `css/constellation.css`, kept original v0.1 CSS intact apart from removing the now-unneeded remote font request, and retained all functional source files.

### Known boundaries

This is a screenshot-guided redesign and not a direct code import from Constellation. The actual Constellation code and complete Gabi art pack were not supplied for this release.

Preset planning switches remain separate from native JSON editing. Preview skins are illustrative and do not produce final regex skins. The platform exporters and actual regex skin mixer remain future milestones.
