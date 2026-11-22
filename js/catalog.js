/**
 * KittyLotus Studio knowledge catalog.
 * These are editorial descriptions grounded in the public repository README,
 * NOT machine-verified key mappings to platform-specific JSON files.
 */
export const REPO = 'kittylotus/KittyLotus-Multimodal';
export const EXTRA_BASE = 'https://raw.githubusercontent.com/kittylotus/-KittyLotus-extras/refs/heads/main/Expressions/';

export const GABIS = [
  {id:"analyzing",name:"Analyzing",file:"gabi_analyzing.png",role:'Bundled official expression'},
  {id:"angry",name:"Angry",file:"gabi_angry.png",role:'Bundled official expression'},
  {id:"bored",name:"Bored",file:"gabi_bored.png",role:'Bundled official expression'},
  {id:"debugging",name:"Debugging",file:"gabi_debugging.png",role:'Bundled official expression'},
  {id:"flustered",name:"Flustered",file:"gabi_flustered.png",role:'Bundled official expression'},
  {id:"frustrated",name:"Frustrated",file:"gabi_frustrated.png",role:'Bundled official expression'},
  {id:"mischievous",name:"Mischievous",file:"gabi_mischievous.png",role:'Bundled official expression'},
  {id:"neutral",name:"Neutral",file:"gabi_neutral.png",role:'Bundled official expression'},
  {id:"playful",name:"Playful",file:"gabi_playful.png",role:'Bundled official expression'},
  {id:"shy",name:"Shy",file:"gabi_shy.png",role:'Bundled official expression'},
  {id:"smug",name:"Smug",file:"gabi_smug.png",role:'Bundled official expression'},
  {id:"startled",name:"Startled",file:"gabi_startled.png",role:'Bundled official expression'},
  {id:"thinking",name:"Thinking",file:"gabi_thinking.png",role:'Bundled official expression'},
  {id:"wary",name:"Wary",file:"gabi_wary.png",role:'Bundled official expression'},
  {id:"yapping",name:"Yapping",file:"gabi_yapping.png",role:'Bundled official expression'}
];

export const CHIBIS = [
  {id:"chibi-gabi-investigate",name:"Investigate",src:"./assets/chibis/chibi-gabi-investigate.png"},
  {id:"chibi-gabi-shh",name:"Shh",src:"./assets/chibis/chibi-gabi-shh.png"},
  {id:"chibi-gabi-surprise",name:"Surprise",src:"./assets/chibis/chibi-gabi-surprise.png"},
  {id:"chibi-gabi-thumbs-up",name:"Thumbs Up",src:"./assets/chibis/chibi-gabi-thumbs-up.png"},
  {id:"chibi-gabi-tired-coffee",name:"Tired Coffee",src:"./assets/chibis/chibi-gabi-tired-coffee.png"}
];

export const SKIN_GROUPS = [
  {id:'weather',name:'Weather & chapter',hint:'Top-of-scene headers and environmental cues.',options:[{id:'noir',name:'Noir · violet dusk'},{id:'warm',name:'Editorial · aged parchment'},{id:'ledger',name:'Field ledger · botanical'}]},
  {id:'gabi',name:'Gabrielle card',hint:'The operator needs a suitable stage.',options:[{id:'glass',name:'Prismatic glass'},{id:'terminal',name:'Diagnostic terminal'},{id:'minimal',name:'Subtle marginalia'}]},
  {id:'tracker',name:'State tracker',hint:'Compact presentation for structured scene state.',options:[{id:'terminal',name:'Terminal green'},{id:'glass',name:'Arcane glass'},{id:'paper',name:'Paper dossier'}]},
  {id:'choice',name:'Next-action choices',hint:'Ways to present branching options.',options:[{id:'card',name:'Stacked cards'},{id:'chips',name:'Rounded choices'},{id:'list',name:'Understated list'}]}
];

export const MODULES = [
  {id:'gabi',icon:'heart',name:'Gabrielle',sub:'Commentary & telemetry',tag:'PERSONNEL / ENGINE OPERATOR',portrait:'smug',summary:'Gabrielle is the engine operator and commentary layer. He can deliver occasional cards, more instrumented monitors, and short live-feed reactions, depending on what you enable.',tip:'Regular Gabrielle and campaign Dungeon Master Gabrielle are separate systems. You can use either, both, or neither.',items:[
    {id:'gabi-card',name:'Commentary cards',desc:'Ordinary Gabrielle asides that react to events without replacing the scene.',impact:'Turning off his visible cards can leave the narrative prose untouched.'},
    {id:'gabi-monitor',name:'Monitor & telemetry',desc:'The heavier presentation, with state-aware monitoring or observations.',impact:'Useful for inspecting an instrumented story; visually busier than occasional commentary.'},
    {id:'gabi-live',name:'Live Feed',desc:'Short, lightweight Gabi commentary layered around ongoing scenes.',impact:'A separate way to surface reactions with less UI than a full monitor.'},
    {id:'gabi-spacing',name:'Comment spacing',desc:'Controls how frequently visible Gabrielle interruptions appear.',impact:'Reducing frequency can keep prose more immersive.'},
    {id:'gabi-intensity',name:'Personality intensity',desc:'How opinionated and prominent the operator feels.',impact:'Controls flavor rather than granting Gabrielle authority over characters.'}
  ]},
  {id:'narrative',icon:'sliders',name:'Agency & Narrative',sub:'POV, handoff, scene initiative',tag:'NARRATIVE / CONTROL',portrait:'thinking',summary:'Choose who can act, from which point of view, and how a scene continues. Agency and POV are separate choices, so the model can narrate richly without hijacking the user character.',tip:'Scene Initiative lets the world and NPCs move independently. It is not permission to invent your character’s voluntary decisions.',items:[
    {id:'n-agency',name:'Player-character agency',desc:'Controls whether voluntary actions and dialogue may be written for the user character.',impact:'One of the most consequential behavior controls. Review before sharing a preset.'},
    {id:'n-pov',name:'Perspective rules',desc:'Independent viewpoint controls for the player character and main character.',impact:'Affects narrative framing, not character knowledge.'},
    {id:'n-mode',name:'Narrative Mode',desc:'Roleplay handoff, continuous scene, or alternating viewpoints.',impact:'Changes when the model gives control back and how viewpoints are presented.'},
    {id:'n-initiative',name:'Scene Initiative',desc:'Allows NPCs and the surrounding world to initiate meaningful motion.',impact:'Keeps scenes active without requiring a user-character action.'}
  ]},
  {id:'prose',icon:'book',name:'Prose & Pacing',sub:'Length, rhythm, interiority',tag:'OUTPUT / STYLE',portrait:'thinking',summary:'KittyLotus separates reply size, narration density, dialogue share, prose style, and interiority into distinct controls instead of hiding everything behind one vague verbosity slider.',tip:'A more ambitious prose level does not automatically require longer replies. Length and language complexity are different axes.',items:[
    {id:'p-length',name:'Reply length',desc:'The response target and tolerated range for visible writing.',impact:'Affects requested output shape, not necessarily plot advancement.'},
    {id:'p-rhythm',name:'Base & Author Style',desc:'Sentence movement, paragraphs, and an optional layer of author-like habits.',impact:'These layers work together. Strong competing settings may dilute the effect.'},
    {id:'p-prose',name:'Prose Level',desc:'Vocabulary and sentence-construction complexity.',impact:'Helps steer the sophistication of prose separately from word count.'},
    {id:'p-interiority',name:'Interiority',desc:'How private thoughts appear in prose.',impact:'Distinct from Automatic Thoughts, which is a separate reveal-style output surface.'},
    {id:'p-pacing',name:'Scene pacing',desc:'Adaptive movement, holding close to the moment, or deliberately dwelling.',impact:'Changes the tempo within a scene, not the whole story arc.'}
  ]},
  {id:'characters',icon:'shield',name:'Character Fidelity',sub:'Motives & knowledge boundaries',tag:'CHARACTER / CONSISTENCY',portrait:'wary',summary:'The engine resists trope flattening and easy personality rewrites. Characters retain their own goals, constraints, knowledge, and plausible reactions.',tip:'Knowledge boundaries matter most in multi-character scenes. NPCs should not learn something solely because the narrator has mentioned it.',items:[
    {id:'c-fidelity',name:'Character fidelity',desc:'Preserves established traits even when convenient drama would tempt a rewrite.',impact:'Strong boundaries keep abrasive, competent, or secretive characters consistent.'},
    {id:'c-knowledge',name:'Knowledge boundaries',desc:'Separates observed, learned, inferred, and unknown facts.',impact:'Reduces accidental omniscience or unauthorized information transfer.'},
    {id:'c-npc',name:'NPC agency',desc:'Other characters can retain independent plans and next actions.',impact:'Gives the world room to respond without scripting the user character.'}
  ]},
  {id:'world',icon:'shield',name:'World Pressure',sub:'Consequences & antagonists',tag:'WORLD / CONSEQUENCE',portrait:'wary',summary:'Control how fair, harsh, restrictive, and surprising the surrounding world can be. Antagonists have their own escalation layer.',tip:'Darkness controls how severe and lasting consequences can get. Failure Consequences does not secretly make attempts fail.',items:[
    {id:'w-auto',name:'AutoWorld',desc:'Infers appropriate world pressure from the scene rather than requiring every value manually.',impact:'Manual world controls are more explicit; automatic pressure can respond to context.'},
    {id:'w-dark',name:'Darkness Level',desc:'A scale of consequence severity and persistence, described as 0 to 5.',impact:'Affects the price of outcomes, not mandatory failure.'},
    {id:'w-hostile',name:'Everyday Hostility',desc:'Supports prejudice, unfairness, and social friction when appropriate to the setting.',impact:'Separate from generic violence or antagonism.'},
    {id:'w-law',name:'World Law',desc:'How readily the setting permits exceptions to its rules.',impact:'Tighter law preserves stronger setting constraints.'},
    {id:'w-villain',name:'Antagonist escalation',desc:'Villain stages, cadence, archetype, fixation, and links to world pressure.',impact:'Distinct from moment-to-moment random complications.'}
  ]},
  {id:'continuity',icon:'history',name:'Story & Continuity',sub:'Arcs, summaries, progress',tag:'STORY / LONG ARC',portrait:'analyzing',summary:'Separate short-scene pacing from long-running story direction. The preset offers character and relationship development, arc tracking, and private continuity summaries.',tip:'Resetting a current story arc should not need to destroy the rest of your preset configuration.',items:[
    {id:'s-direction',name:'Story Direction',desc:'The kind of story movement the engine should favor over time.',impact:'Broad arc direction is distinct from pacing inside one scene.'},
    {id:'s-progress',name:'Character & Relationship Progress',desc:'How quickly lasting changes become established.',impact:'Keeps slow-burn progression separate from individual emotional scenes.'},
    {id:'s-track',name:'Story Tracking',desc:'Records evolving story arcs and ongoing pressures.',impact:'Adds longer-term continuity beyond a transient state panel.'},
    {id:'s-summary',name:'Continuity Summary',desc:'Periodic private compression of recent turns, with configurable depth.',impact:'Useful for long sessions, with additional context overhead.'}
  ]},
  {id:'trackers',icon:'database',name:'Trackers & Ledgers',sub:'State, motive, psyche, trace',tag:'STATE / INSTRUMENTATION',portrait:'analyzing',summary:'KittyLotus has a tracker backend selector and multiple state surfaces. Tracking what exists and showing it on screen are separate concerns.',tip:'Motive and psychological ledgers are only useful when the relevant tracking backend and inputs are in play.',items:[
    {id:'t-engine',name:'Tracker Engine',desc:'Chooses the tracking backend used to maintain state.',impact:'Affects the foundation that richer ledgers depend on.'},
    {id:'t-categories',name:'What to Track',desc:'Selects the categories of information worth maintaining.',impact:'A narrow state record is cheaper and often easier to keep consistent.'},
    {id:'t-display',name:'Tracker Display',desc:'How native tracked state appears in the narrative interface.',impact:'Can be changed independently from the data being tracked.'},
    {id:'t-motive',name:'Motive Ledger',desc:'Goals, pressures, motives, and contextual character trace information.',impact:'Depends on appropriate narrative signals and tracked state.'},
    {id:'t-psyche',name:'Psychological State Ledger',desc:'Continuity for up to three NPC psychological states.',impact:'Designed for ongoing psychological context, not instant mind-reading.'},
    {id:'t-scene',name:'Scene Trace',desc:'A modular inspection surface for facts, signals, social geometry, and knowledge.',impact:'More diagnostic detail, independent of prose polish.'}
  ]},
  {id:'interfaces',icon:'layout',name:'Interfaces & Decor',sub:'Choices, HTML, headers',tag:'OUTPUT / VISUAL SURFACES',portrait:'playful',summary:'The preset can stay text-only, but also supports styled choice cards, chapter and weather headers, text effects, automatic thoughts, and interactive interfaces.',tip:'Visual output and the regex script that skins it are different pieces. A matching output format and processing pipeline are both required.',items:[
    {id:'i-cyoa',name:'Next-Action Choices',desc:'Choice prompts and optional stylistic regex presentation.',impact:'Campaign choices yield to the main CYOA system if both are active.'},
    {id:'i-weather',name:'Chapter & Weather Headers',desc:'Structured header surfaces for chapter and environmental context.',impact:'Visual skins can change the surface while keeping underlying data intact.'},
    {id:'i-thoughts',name:'Automatic Thoughts',desc:'Separate click-to-reveal NPC thought cutaways.',impact:'Not the same as normal prose interiority.'},
    {id:'i-html',name:'Interactive Interfaces',desc:'Structured HTML interfaces, selectable complexity, and UI style.',impact:'Compatibility is platform-dependent and must be tested.'},
    {id:'i-text',name:'Text Effects',desc:'Dialogue colors, written text, emotion, and volume effects.',impact:'Adds visual encoding and requires compatible display behavior.'}
  ]},
  {id:'social',icon:'message',name:'Social Formats',sub:'Messages & feed framing',tag:'OUTPUT / SOCIAL',portrait:'playful',summary:'Render chat-like and social surfaces, from phone messages and Discord-style posts to broader feeds and quick actions.',tip:'Separate the content markup from the style layer, so a skin swap does not require changing prompt semantics.',items:[
    {id:'so-messages',name:'Social messages',desc:'Formatted chats and conversations using dedicated output structures.',impact:'Requires matching rendering support in the target platform.'},
    {id:'so-feed',name:'Phone & Feed framing',desc:'Optional full phone or feed presentation around social content.',impact:'More immersive and more visually demanding than plain dialogue.'},
    {id:'so-actions',name:'Quick actions',desc:'Optional interaction surfaces attached to social output.',impact:'Behavior depends on host support; not automatically portable.'}
  ]},
  {id:'campaign',icon:'dice',name:'Campaign DM',sub:'Dice, paths, character sheets',tag:'CAMPAIGN / MODE',portrait:'playful',summary:'The separate campaign system gives Gabrielle a Dungeon Master role, with character creation, roll checks, and staged actions.',tip:'The campaign choice surface yields to the main CYOA system when both are enabled.',items:[
    {id:'d-dm',name:'Gabi as Dungeon Master',desc:'Activates the independent campaign console.',impact:'Does not require regular Gabrielle commentary to be on.'},
    {id:'d-panel',name:'DM panel presentation',desc:'Large portrait hero presentation or compact console.',impact:'An appearance choice, not a change to dice rules.'},
    {id:'d-dice',name:'Relevant roll checks',desc:'Pre-rolled relevant checks with optional result reveals.',impact:'Supports explicit uncertainty and legible outcomes.'},
    {id:'d-sheet',name:'Character sheet & opening builder',desc:'Optional character-sheet access and initial stat distribution.',impact:'Most useful when starting a new campaign chat.'}
  ]},
  {id:'models',icon:'workflow',name:'Model Routing',sub:'Adapters & private control',tag:'MODEL / ADAPTATION',portrait:'debugging',summary:'Model-specific adapters and private control passes help manage differences in model behavior, continuity, and visible output.',tip:'A model adapter is not a universal compatibility guarantee. Test exported presets on their actual target host.',items:[
    {id:'m-detect',name:'Model detection & adapters',desc:'Automatic support for known models and manual model selection as a fallback.',impact:'Adjusts prompt behavior for model quirks.'},
    {id:'m-pass',name:'Control Pass',desc:'Configurable depth and placement of private pre-output checks.',impact:'Can improve coordination at the cost of extra instruction complexity.'},
    {id:'m-checks',name:'Extra scene checks',desc:'Optional passes for scene pressure, priorities, and likely costs.',impact:'Should remain separate from the prose the user actually sees.'}
  ]},
  {id:'rolls',icon:'dice',name:'Roll Engines',sub:'Variance & emotional signals',tag:'RANDOMIZATION / CONTROLLED',portrait:'yapping',summary:'Optional chance systems add variance to prose patterns, events, emotional reads, and slowburn developments, with safeguards against disproportionate disruption.',tip:'More randomness does not automatically mean more meaningful narrative consequences.',items:[
    {id:'r-prose',name:'Prose Variation Rolls',desc:'Light stochastic changes to reduce repetitive patterns.',impact:'Primarily a stylistic shake-up.'},
    {id:'r-events',name:'Random Event Rolls',desc:'Small complications or significant interruptions, with frequency controls.',impact:'Best moderated by a chaos harm filter.'},
    {id:'r-slow',name:'Slowburn Signal Rolls',desc:'More nuanced uncertainty in emotional interpretation.',impact:'Distinct from forcing a romantic outcome.'},
    {id:'r-emotion',name:'Emotional Impact Checks',desc:'Context-aware emotional results with optional visible records.',impact:'Supports gradual character reactions instead of arbitrary pivots.'}
  ]},
  {id:'intimacy',icon:'heart',name:'Intimacy Progression',sub:'Gates & relational pacing',tag:'RELATIONSHIPS / PACING',portrait:'thinking',summary:'Adult content has a separate on/off gate. When enabled, other controls can shape the pace and form of intimacy without erasing established character context.',tip:'Adult content should remain disabled if the story does not call for it. Interpersonal continuity is not interchangeable with narrative speed.',items:[
    {id:'a-content',name:'Adult-content gate',desc:'Whether adult content is enabled at all.',impact:'An explicit boundary that should never be silently inferred.'},
    {id:'a-gate',name:'Intimacy Gate',desc:'How readily intimacy may develop when the feature is enabled.',impact:'Prevents rapidly skipping established relationship development.'},
    {id:'a-style',name:'Style & multi-turn pacing',desc:'Presentation and turn-to-turn progression of intimate moments.',impact:'Separate from general story progression.'}
  ]}
];

export const DEFAULT_SKINS={weather:'noir',gabi:'glass',tracker:'terminal',choice:'card'};
export const DEFAULT_DEMO_SCRIPTS=[
 {scriptName:'DEMO ONLY / Gabi card',findRegex:'\\[GABI\\]([\\s\\S]*?)\\[/GABI\\]',replaceString:'<div class="gabi"><strong>GABRIELLE</strong><p>$1</p></div>',disabled:false},
 {scriptName:'DEMO ONLY / State card',findRegex:'\\[STATE\\]([\\s\\S]*?)\\[/STATE\\]',replaceString:'<div class="state"><strong>SCENE STATE</strong><p>$1</p></div>',disabled:false}
];
