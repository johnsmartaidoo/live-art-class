# Atelier Live — Design Direction

## Three stylistic approaches

### Theme Name: Workshop Ledger
Very Brief Intro: A tactile, editorial art-school interface built from bone paper, ink, olive, and clay accents. It treats the dashboard like a beautifully composed lesson sheet rather than a generic SaaS panel.
Probability: 0.07

### Theme Name: Signal Studio
Very Brief Intro: A dark broadcast-room aesthetic with warm monitor light, live indicators, and a high-contrast collaborative canvas. It feels focused, technical, and made for night sessions.
Probability: 0.03

### Theme Name: Color Field Commons
Very Brief Intro: An airy, gallery-like classroom with large color planes, generous whitespace, and a playful but disciplined visual rhythm. It makes each lesson feel like a small exhibition.
Probability: 0.08

## Selected direction: Workshop Ledger

### Design Movement
Contemporary editorial craft — part independent art-school handbook, part analog studio desk, with Swiss-inspired hierarchy softened by material texture and handwritten marks.

### Core Principles
1. **Make the process visible.** Tools, strokes, notes, and live status should feel like part of the work rather than hidden behind chrome.
2. **Balance structure with hand-made irregularity.** Use a disciplined layout, then interrupt it with underlines, swatches, clipped notes, and imperfect marks.
3. **Give the canvas the room.** The drawing surface is the hero interaction; surrounding panels should guide without competing.
4. **Use color as editorial punctuation.** Most of the interface is bone and ink; olive and clay appear in moments that matter.

### Color Philosophy
Bone (#f5f0e7) creates the feeling of an open sketchbook. Ink-black (#1e201c) gives the class a calm, readable backbone. Olive (#67735c) signals making and progress without the artificial energy of neon. Clay (#c96e52) is reserved for live presence, saved states, and moments that deserve attention. The palette should feel found in a studio, not selected from a software dashboard.

### Layout Paradigm
A workshop table composition: a narrow left rail for class identity and navigation, a large central workbench for the live lesson and canvas, and a slim right column for prompts and participants. On small screens, the rail becomes a compact header and the right column stacks beneath the workbench.

### Signature Elements
- A hand-drawn olive loop mark used as the brand symbol and a small visual anchor in section headers.
- Red-pencil style annotation rules and underlines that look like an instructor's notes.
- Material swatches and paper-like cards with clipped corners, grain, and quiet offset shadows.

### Interaction Philosophy
Every tool should explain itself through its label, shortcut, or live state. Buttons respond like physical controls with a quick press-in. The drawing canvas should feel immediate and forgiving: undo/redo, eraser, clear, export, and a visible saved state are always close by.

### Animation
Use subtle slide-and-fade entrances for the class rail and panels, under 260ms. Let the live dot pulse slowly, but keep drawing interactions instant. Hover states should use a 100–160ms color or transform transition. Avoid ornamental motion around the canvas; the user's marks are the animation. Respect reduced-motion preferences.

### Typography System
Use Fraunces for display headlines and section labels that benefit from warmth. Use DM Sans for navigation, controls, and readable body copy. Use a small uppercase tracking style for metadata and shortcuts. Headline hierarchy should feel like a printed lesson sheet: bold, slightly condensed in rhythm, never oversized for its own sake.

### Brand Essence
Atelier Live is a live, low-pressure studio for people learning to see and make together; it is different because the teaching space and the drawing space are one continuous workbench. Personality: **observant, generous, tactile**.

### Brand Voice
Headlines sound like an instructor's note pinned to the wall. CTAs are direct, warm, and specific. Microcopy should reassure without becoming cute.

Example lines:
- “Draw what you notice, not what you think you know.”
- “The room is open. Bring a soft pencil.”

### Wordmark & Logo
Use a custom-feeling wordmark set in Fraunces with a small hand-drawn olive loop mark beside it. The mark is a single abstract graphite spiral meeting an olive paint stroke, with a clay accent dot — no default tech iconography.

### Signature Brand Color
**Studio Olive — #67735c**, the color of a well-used ceramic water cup beside an open sketchbook.

## File-level reminder
All UI files should reinforce Workshop Ledger: bone paper, ink structure, studio olive, clay punctuation, editorial type, asymmetric workbench composition, and tactile but restrained motion. Ask: “Does this choice make the process more visible, or does it dilute the studio?”

## GitHub Pages note
The interface is intentionally client-side and uses browser APIs for drawing, local persistence, and export. Live video is represented as a host-ready lesson room shell; a production live stream provider or WebRTC backend can be connected later without changing the visual workbench.

## Style Decisions

- On desktop, Atelier Live always keeps a branded studio rail with a Fraunces wordmark and olive loop mark; the top chrome also carries a small brand lockup so the identity survives cropped or mobile contexts.
- The hand-drawn olive loop, clay live dot, red-pencil underline, and taped/clipped paper treatments are mandatory recurring motifs for Workshop Ledger screens.
- Cards and controls must read as paper notes, studio labels, or physical tools. Material texture and editorial dividers take priority over generic SaaS decoration.
- The shared sketch sheet is the core artifact of each room; video, prompt, participant, and schedule panels should feel like supporting notes around it.
