# DocuGuard AI — Visual Design Directions

**Document Reference:** `docs/design-directions.md`
**Status:** Official Decision Selected (Direction 5: Deep Teal × Champagne — Refined Glass)
**Context:** Pre-Design System & Theme Architecture for DocuGuard AI (Incident Report Review System)
**Source Specification:** [docs/product-context.md](docs/product-context.md)

---

## 1. Executive Summary & Foundational Constraints

DocuGuard AI is an AI-assisted IT incident report review system designed to support human reviewers by checking the completeness and compliance of reports against user-provided Standard Operating Procedures (SOPs) and report templates.

### Decision Status:
- **Official Selected Direction:** **Direction 5: Deep Teal × Champagne — "Refined Glass"**
- **Archived Alternatives (Preserved):** Direction 1 (Forest Green & Emerald), Direction 2 (Navy & Teal), Direction 3 (Charcoal & Warm Neutral), Direction 4 (Ivory & Cobalt).

### Core Product Boundaries (per `docs/product-context.md`):
- **First-Pass Review Assistant (Non-Authoritative):** DocuGuard AI functions strictly as an assistive first-pass reviewer. It does **not** have authority to grant automatic approvals or final audits. All final decisions and accountability rest solely with human reviewers.
- **Proposed User Personas:** For the purpose of exploring UI workflows, potential user personas include report authors (e.g., engineers or operational staff drafting incident post-mortems) and report reviewers (e.g., incident leads, team managers, or compliance reviewers). These are treated as **proposed working personas** pending confirmation.
- **Strict Decoupling of Status and Severity:**
  - **Fulfillment Status (Status Pemenuhan):** `Fulfilled`, `Partially fulfilled`, `Not found`, `Not applicable`, `Needs human review`
  - **Severity (Tingkat Keparahan):** `Informational`, `Minor`, `Major`, `Critical`
  - *Crucial Rule:* Status and severity are two independent, orthogonal attributes. **Missing evidence (`Not found`) does not automatically imply `Critical` or `Major` severity.** An omitted non-essential section may simply be `Not found` with `Informational` severity, whereas a missed critical escalation step would be `Not found` with `Critical` severity.
- **MVP Platform Scope:** Desktop and laptop web interface (1280px to 1920px+). **Dark mode is a potential future consideration**, not an MVP requirement. The primary MVP target is a clear, legible light-mode interface optimized for document review.
- **Avoidance of AI Tropes:** Avoid generic AI dashboard aesthetics (e.g., saturated purple gradients, glowing neon borders, heavy frosted glassmorphism). The UI must feel like dependable enterprise compliance software prioritizing evidence traceability and legibility.

---

## 2. Direction 1: Forest Green & Emerald — "The Institutional Audit" *(Archived Alternative)*

### Design Philosophy & Visual Personality
- **Personality:** Refined, trustworthy, grounded, institutional.
- **Concept:** Evokes the credibility of established compliance registries, quality institutions, and archival record-keeping. DocuGuard AI is presented as a disciplined, orderly review assistant that methodically cross-references documentation against established standards.
- **Visual Rhythm:** Balanced density, classical proportions, structured paper-like surfaces, crisp hairline borders, and subtle organic depth.

### Color Palette (Hex Specifications)
- **Primary Brand:** Deep Forest `#123326` (Commanding deep green with high black saturation)
- **Secondary Brand:** Pine Reserve `#1E4D3B` (Mid-tone forest for active navigational states and section framing)
- **Brand Accent:** Polished Emerald `#10B981` (Used strictly for non-text graphical accents, active indicator pills, and focus outlines)
- **Neutral Backgrounds:**
  - Canvas: Chalk Bone `#F9F9F6` (Warm, non-glare off-white reducing eye strain during long audits)
  - Surface Card: Pure White `#FFFFFF`
  - Elevated Surface: Warm Cream `#F2F2EC`
- **Neutral Text & Hairlines:**
  - Ink Primary: Charcoal Bark `#191F1C`
  - Ink Secondary: Muted Pine-Slate `#53635B`
  - Border Hairline: Sage Mist `#DDE3DE` (1px solid hairline)
- **Semantic Separation Strategy:**
  - Brand green (`#123326`) is kept dark and near-black.
  - To prevent brand-semantic confusion, the `Fulfilled` status badge uses an emerald tone (`#065F46` text on `#ECFDF5` background), while primary action buttons use Deep Forest `#123326`, clearly distinguishing brand controls from compliance status tags.

### Typography & Font Pairing
- **Display & Headings:** *Newsreader* or *Fraunces* (Optical size 72, Semi-Bold) — used selectively for top-level page headers to convey an editorial, institutional audit tone.
- **Interface & Body:** *Inter* or *Plus Jakarta Sans* (Regular 400, Medium 500) — clean geometric sans for dense tables, forms, and report text.
- **Monospace (Timestamps & Evidence IDs):** *JetBrains Mono* (Regular 400, Tabular numbers).

### Surface Treatment, Borders & Elevation
- **Surfaces:** Flat, solid cards with crisp 1px borders (`#DDE3DE`). No frosted glassmorphism.
- **Corner Radius:** Conservative rounding (Cards: `8px`, Buttons: `6px`, Badges: `4px`).
- **Shadows:** Subtle diffuse elevation:
  - Base: `0 1px 2px rgba(18, 51, 38, 0.05)`
  - Elevated Drawer / Modal: `0 8px 24px -4px rgba(18, 51, 38, 0.08), 0 2px 6px -1px rgba(18, 51, 38, 0.04)`

### Component Styling
- **Sidebar:** Dark Forest `#123326` background with high-contrast text, or light Bone `#F2F2EC` with an emerald indicator strip (`3px` active left border).
- **Cards & Data Tables:** High-density tables with subtle zebra striping (`#FAFAFA`), hairline column dividers (`#E5E7EB`), and sticky headers.
- **Badges:** Pill or rectangular with `4px` radius, utilizing soft tinted backgrounds with solid border outlines (e.g., `Needs human review`: `#FAF5FF` bg, `#6B21A8` text, `#E9D5FF` border).

### Accessibility & Contrast Evaluation
- **Primary Text Contrast:** Charcoal Bark `#191F1C` on Chalk Bone `#F9F9F6` yields **15.88:1** (Exceeds WCAG AAA requirement of 7.0:1 for normal text).
- **Secondary Text Contrast:** Muted Pine-Slate `#53635B` on Chalk Bone `#F9F9F6` yields **6.03:1** (Passes WCAG AA requirement of 4.5:1; fails AAA requirement of 7.0:1).
- **Accent Graphic Contrast:** Brand Accent `#10B981` on Pure White `#FFFFFF` yields **2.54:1** (Fails text contrast; strictly reserved for non-text graphical UI components or paired against dark backgrounds like `#123326` where it yields **5.42:1**, passing WCAG AA graphical/large text).

### Strengths & Weaknesses
- **Strengths:** Commands institutional credibility and seriousness; avoids generic SaaS aesthetics; warm off-white canvas supports comfortable reading.
- **Weaknesses:** Requires strict discipline to prevent brand green from colliding with semantic `Fulfilled` green badges; serif headers may feel overly traditional if uncalibrated.

---

## 3. Direction 2: Navy & Teal — "The Mission-Critical Observatory" *(Archived Alternative)*

### Design Philosophy & Visual Personality
- **Personality:** Structured, technical, analytical, disciplined.
- **Concept:** Draws inspiration from high-reliability operational dashboards and systems monitoring consoles. It emphasizes structured modularity, explicit data grids, and clear visual signposting.
- **Visual Rhythm:** High data density, tabular rigor, modular panels, technical gridlines, and sharp micro-indicators.

### Color Palette (Hex Specifications)
- **Primary Brand:** Deep Admiralty Navy `#0F172A` (Slate 900 — technical, deep obsidian navy)
- **Secondary Brand:** Steel Blue `#334155` (Slate 700 — structural boundaries, inactive states)
- **Brand Accent:** Deep Cyan-Teal `#0369A1` / `#0284C7` (Controlled cyan-teal for interactive controls, focus states, and primary actions)
- **Neutral Backgrounds:**
  - Canvas: Arctic Grey `#F8FAFC` (Slate 50 — clean, crisp, cold architectural white)
  - Surface Card: Pure White `#FFFFFF`
  - Sub-surface / Sidebar: Frosted Steel `#F1F5F9` (Slate 100)
- **Neutral Text & Hairlines:**
  - Ink Primary: Obsidian Slate `#020617` (Slate 950)
  - Ink Secondary: Cool Grey `#64748B` (Slate 500)
  - Border Hairline: Ice Border `#CBD5E1` (Slate 300)
- **Semantic Separation Strategy:**
  - Brand identity is anchored in deep navy and cyan.
  - Zero conflict with `Fulfilled` (Green: `#15803D`), `Partially fulfilled` (Amber: `#B45309`), or `Critical` (Red: `#B91C1C`).
  - `Needs human review` is distinctly mapped to Indigo/Violet (`#6B21A8` on `#FAF5FF`) without chromatic overlap with brand cyan.

### Typography & Font Pairing
- **Interface & Headings:** *Geist* or *IBM Plex Sans* (Medium 500, Semi-Bold 600) — engineered for technical clarity, structured alignment, and dense UI presentation.
- **Monospace:** *Geist Mono* or *IBM Plex Mono* (Regular 400) for Incident IDs, timestamps, and policy clause references.

### Surface Treatment, Borders & Elevation
- **Surfaces:** Structured rectangular modules with razor-sharp 1px borders (`#CBD5E1` / `#E2E8F0`). Zero background blur or glassmorphism.
- **Corner Radius:** Compact industrial (Cards: `6px`, Buttons: `4px`, Badges: `3px`).
- **Shadows:** Minimalist technical offset:
  - Base: `0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`
  - Dropdown / Flyout: `0 10px 15px -3px rgba(15, 23, 42, 0.1)`

### Component Styling
- **Sidebar:** Slate-navy vertical dock (`#0F172A`) with high-contrast icons, or light Frosted Steel (`#F1F5F9`) with slate active indicators.
- **Cards & Data Tables:** Border-collapsed table cells, tabular numeric alignments, explicit column resizers, and row hover states in `#F8FAFC`.
- **Badges:** Square-cornered pill badges with subtle dot indicators (e.g., `Critical` = red dot + `#FEF2F2` background + `#991B1B` text).

### Accessibility & Contrast Evaluation
- **Primary Text Contrast:** Obsidian Slate `#020617` on Arctic Grey `#F8FAFC` yields **19.28:1** (Exceeds WCAG AAA). Slate 900 `#0F172A` on Arctic Grey yields **17.06:1** (Exceeds WCAG AAA).
- **Secondary Text Contrast:** Slate 500 `#64748B` on Arctic Grey `#F8FAFC` yields **4.55:1** (Passes WCAG AA minimum of 4.5:1 for normal text; fails WCAG AAA).
- **Interactive Control Contrast:** Deep Cyan-Teal `#0369A1` on Pure White `#FFFFFF` yields **5.77:1** (Passes WCAG AA for normal text; exceeds 3.0:1 for graphical/UI components).

### Strengths & Weaknesses
- **Strengths:** Highly familiar structure for IT technical personnel; flawless semantic separation from all status tags; exceptional data density.
- **Weaknesses:** Runs the risk of appearing generic or standard if typographic hierarchy and border micro-spacing are not carefully crafted.

---

## 4. Direction 3: Charcoal & Warm Neutral — "The Precision Monograph" *(Archived Alternative)*

### Design Philosophy & Visual Personality
- **Personality:** Understated, bespoke, intellectual, archival, quiet.
- **Concept:** Inspired by architectural documentation, technical monographs, and Swiss editorial design. It eliminates artificial chromatic noise to focus entirely on document structure, textual hierarchy, and content clarity.
- **Visual Rhythm:** Generous micro-spacing, subtle tonal layering rather than heavy drop shadows, monochrome primary controls, and surgical isolation of semantic color.

### Color Palette (Hex Specifications)
- **Primary Brand:** Matte Charcoal `#1C1917` (Stone 900 — warm architectural charcoal)
- **Secondary Brand:** Warm Mineral `#44403C` (Stone 700 — secondary hierarchy)
- **Brand Accent:** Deep Bronze `#854D0E` / Deep Amber (Used minimally for focal accents, while primary interactive actions utilize stark high-contrast Charcoal `#1C1917`)
- **Neutral Backgrounds:**
  - Canvas: Parchment Grey `#F5F5F4` (Stone 100 — textured, warm neutral white)
  - Surface Card: Pure Linen `#FAFAF9` (Stone 50)
  - Elevated Surface: Pure White `#FFFFFF`
- **Neutral Text & Hairlines:**
  - Ink Primary: Deep Basalt `#0C0A09` (Stone 950)
  - Ink Secondary: Stone 600 `#57534E` (Calibrated for strict WCAG compliance)
  - Border Hairline: Mineral Line `#E7E5E4` (Stone 200)
- **Semantic Separation Strategy:**
  - Because the brand and structural container palette is monochromatic stone and charcoal, **semantic colors stand out with absolute clarity**. A red severity badge or green fulfillment status tag has zero competition from brand accents.

### Typography & Font Pairing
- **Interface & Headings:** *General Sans* or *Satoshi* (Medium 500, Bold 700) — modern geometric grotesk with subtle warmth.
- **Reading / Body:** *Switzer* or *Inter* (Regular 400, Line-height 1.6) — optimized for sustained reading of policy clauses and long incident descriptions.
- **Monospace:** *Commit Mono* or *Space Mono* (Regular 400).

### Surface Treatment, Borders & Elevation
- **Surfaces:** Layered warm tonal planes. Elevation is communicated through tone shifts (`#F5F5F4` -> `#FAFAF9` -> `#FFFFFF`) rather than heavy drop shadows.
- **Corner Radius:** Sharp architectural radii (Cards: `4px`, Buttons: `3px`, Badges: `2px`).
- **Shadows:** Nearly flat; faint ambient occlusion only: `0 1px 1px rgba(0, 0, 0, 0.04)`.

### Component Styling
- **Sidebar:** Warm Alabaster (`#FFFFFF`) with razor-thin hairline divider (`#E7E5E4`), understated typography, and black square indicator pips.
- **Cards & Data Tables:** Minimalist divider lines, generous cell padding, subtle grey hover fills, and structured section numbering (e.g., `01 / SOP COMPLIANCE`, `02 / TEMPLATE COMPLETENESS`).
- **Badges:** Micro-badges with subtle tinted backgrounds and crisp dark borders (e.g., `Partially fulfilled` = `#FFFBEB` bg, `#92400E` text, `#FDE68A` border).

### Accessibility & Contrast Evaluation
- **Primary Text Contrast:** Deep Basalt `#0C0A09` on Parchment Grey `#F5F5F4` yields **18.11:1** (Exceeds WCAG AAA). Matte Charcoal `#1C1917` on Parchment Grey yields **16.03:1** (Exceeds WCAG AAA).
- **Secondary Text Contrast:** Stone 600 `#57534E` on Parchment Grey `#F5F5F4` yields **6.99:1** (Passes WCAG AA; virtually matches AAA threshold of 7.0:1). Note: The lighter Stone 500 (`#78716C`) yields 4.40:1, which falls just short of the 4.5:1 AA requirement, so Stone 600 is mandated for compliant body copy.
- **Semantic Text Contrast:** Amber 800 `#92400E` on Amber 50 `#FFFBEB` yields **6.84:1** (Passes WCAG AA).

### Strengths & Weaknesses
- **Strengths:** Exceptionally clean and fatigue-free for extended multi-hour document audits; zero chromatic competition with semantic badges; distinctive editorial aesthetic.
- **Weaknesses:** May feel overly austere or understated to stakeholders expecting traditional enterprise software cues; requires very disciplined typographic scale to maintain visual hierarchy without color crutches.

---

## 5. Direction 4: Ivory & Cobalt — "The Swiss Verification Lab" *(Archived Alternative)*

### Design Philosophy & Visual Personality
- **Personality:** Modern, precise, confident, clinical, definitive.
- **Concept:** Inspired by international typographic style (Swiss Design) and precision laboratory verification instruments. It pairs high-contrast cobalt with crisp ivory surfaces to communicate accuracy, diagnostic clarity, and clean efficiency.
- **Visual Rhythm:** Bold typographic scale contrast, modular card containers, and purposeful ultramarine navigational elements.

### Color Palette (Hex Specifications)
- **Primary Brand:** Precision Cobalt `#1E40AF` (Blue 800 — deep, vibrant royal cobalt)
- **Secondary Brand / Sidebar:** Slate Cobalt `#1E293B` (Grounded dark slate for structural framing)
- **Brand Accent / Primary Action:** Royal Blue `#2563EB` (Blue 600 — interactive buttons, focus states, active tab bars)
- **Neutral Backgrounds:**
  - Canvas: Pure Ivory `#FDFDFD` / `#F8FAFC`
  - Surface Card: Pure White `#FFFFFF`
  - Muted Inset / Table Zebra: Pale Tint `#F1F5F9` / `#F8FAFC`
- **Neutral Text & Hairlines:**
  - Ink Primary: Deep Onyx `#0F172A` (Slate 900)
  - Ink Secondary: Steel Slate `#475569` (Slate 600)
  - Border Hairline: Crisp Slate `#E2E8F0` (Active / Focus borders: `#DBEAFE` / `#93C5FD`)
- **Semantic Separation Strategy:**
  - **Brand Colors:** Cobalt `#1E40AF` and Royal Blue `#2563EB` are strictly reserved for brand identity, structural framing, navigation indicators, and primary interaction triggers (e.g. `Run Recheck`).
  - **Semantic Statuses (Strict Isolation):**
    - `Fulfilled`: Emerald `#065F46` on soft `#ECFDF5` tint with `#A7F3D0` border.
    - `Partially fulfilled`: Amber `#92400E` on soft `#FEF3C7` tint with `#FDE68A` border.
    - `Not found`: Neutral Slate `#475569` on `#F1F5F9` tint with `#CBD5E1` border (Muted to prevent bias).
    - `Needs human review`: Distinct **Purple/Violet** (`#6B21A8` on `#FAF5FF` tint with `#E9D5FF` border). Because brand is blue, using purple for triage guarantees **zero cognitive confusion** between brand controls and flagged audit items.
    - `Critical / Major`: Crimson Vermillion `#B91C1C`.
    - `Minor`: Amber `#B45309`.
    - `Informational`: Neutral Slate `#475569`.

### Typography & Font Pairing
- **Headings & Hierarchy:** *Plus Jakarta Sans* or *Inter* (Bold 700, Semi-Bold 600) — crisp neo-grotesk with structured tracking on headers.
- **Body & Data:** *Inter* (Regular 400, Medium 500) — high legibility across dense data tables.
- **Monospace:** *JetBrains Mono* (Medium 500) for evidence line-number citations (e.g., `L42-58: sec_mitigation`).

### Surface Treatment, Borders & Elevation
- **Surfaces:** Clean, crisp cards with sharp 1px borders (`#E2E8F0`). Subtle cobalt-tinted borders (`#DBEAFE`) on summary cards and recommendation callouts.
- **Corner Radius:** Balanced modern (Cards: `8px`, Buttons: `6px`, Badges: `4px`).
- **Shadows:** Clean architectural lift:
  - Base: `0 1px 3px rgba(15, 23, 42, 0.05)`
  - Elevated Card: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`

### Component Styling
- **Sidebar:** Deep Slate-Cobalt (`#1E293B`) with royal cobalt active state (`#1E40AF` + `#2563EB` indicator pip) and crisp white text.
- **Cards & Data Tables:** High-definition table headers with subtle uppercase labels (`10px`, `letterSpacing: 0.8`), bold finding counters, and segmented tab controls for `SOP Compliance` vs. `Template Completeness`.
- **Badges:** Soft-tinted tags with crisp text and distinct iconography for both status and severity.

### Accessibility & Contrast Evaluation
- **Primary Text Contrast:** Deep Onyx `#0F172A` on Pure Ivory `#FDFDFD` yields **17.55:1** (Exceeds WCAG AAA).
- **Secondary Text Contrast:** Steel Slate `#475569` on Pure Ivory `#FDFDFD` yields **7.45:1** (Exceeds WCAG AAA requirement of 7.0:1).
- **Brand Interactive Contrast:**
  - Precision Cobalt `#1E40AF` on Pure White `#FFFFFF` yields **8.72:1** (Exceeds WCAG AAA for normal text).
  - Royal Blue `#2563EB` on Pure White `#FFFFFF` yields **5.17:1** (Passes WCAG AA for normal text; fails WCAG AAA).

### Strengths & Weaknesses
- **Strengths:** Clean, energetic, and highly readable; high user familiarity; crisp visual cues for complex multi-document reviews; flawless separation of brand blue from purple triage indicators.
- **Weaknesses:** If cobalt is overused, it can feel like a generic SaaS or fintech application; must be carefully balanced with calm neutral ivory surfaces.

---

## 6. Direction 5: Deep Teal × Champagne — "Refined Glass" *(SELECTED — Official Design Direction)*

### Design Philosophy & Visual Personality
- **Personality:** Professional, trustworthy, sophisticated, analytical, precise, modern.
- **Concept:** Combines the grounded authority of Deep Teal (`#174C4A`) and Warm Porcelain (`#F4F1E9`) with restrained, architectural Refined Glass surfaces (`#FFFEFA` at controlled translucency) and sparing Champagne (`#D5B77A`) focal accents. It projects technological sophistication and analytical precision without looking like generic AI SaaS or overly decorative luxury UI.
- **Visual Rhythm:** Layered surface depth (Strong Glass, Moderate Glass, Solid Readability Surfaces), thin low-contrast borders (`#E3E0D6`), subtle backdrop blur, and calm warm-neutral reading planes.

### Official Color Palette (Exact Design Tokens)
- **Primary / Deep Teal:** `#174C4A` (Dominant brand anchor, primary interactive buttons, active states, and dark sidebar foundation)
- **Hover Primary:** `#123D3B` (Deepened teal for hover/active interaction states and sidebar depth)
- **Secondary / Muted Teal:** `#477C76` (Secondary brand accents, progress indicators, subtle highlights, and secondary graphical elements)
- **Accent / Champagne:** `#D5B77A` (Used sparingly for high-value focal accents, active sidebar icon indicators, and subtle badge/ring highlights; never overused as a dominant fill)
- **Background / Warm Porcelain:** `#F4F1E9` (Calm, non-glare warm porcelain canvas optimized for extended reading)
- **Surface / Soft Ivory:** `#FFFEFA` (Primary card, table, and evidence surface base)
- **Subtle Teal Surface:** `#EAF1ED` (Tinted soft fills, selected row highlights, and subtle interactive chips)
- **Primary Text / Charcoal:** `#263331` (High-contrast teal-infused charcoal for headings and primary body copy)
- **Secondary Text:** `#64716D` (Muted mineral-teal grey for metadata, captions, and secondary descriptions; paired with `#43524E` for lead body text)
- **Border:** `#E3E0D6` (Thin, low-contrast warm stone border hairline)

### Semantic Separation Strategy (Orthogonal Status & Severity)
- **Compliance Fulfillment Statuses:**
  - `Fulfilled`: Emerald Jade `#1B6B4A` on `#E1F2EA` soft tint (distinct from Deep Teal `#174C4A`).
  - `Partially Fulfilled`: Warm Amber `#8A5A10` on `#F7EBD2` soft tint.
  - `Not Found`: Crimson Terracotta `#A63A35` on `#F7E2E0` soft tint.
  - `Not Applicable`: Neutral Mineral `#5C6864` on `#E9E7DF` soft tint.
  - `Needs Review` / `Awaiting Human Review`: Slate Indigo `#35597A` on `#E4EEF5` soft tint (clearly separated from both Deep Teal brand controls and Emerald `Fulfilled` badges).
- **Finding Severity Levels (Independent Dimension with Signal Bars):**
  - `Information`: Neutral Charcoal-Grey `#64716D` on `#FFFEFA` with `#E3E0D6` border.
  - `Minor`: Warm Champagne-Amber `#6E521C` on `#F5EEDF` with `#D5B77A` border.
  - `Major`: Deep Ochre-Terracotta `#7C3E0E` on `#F9E8D2` with `#D99B52` border.
  - `Critical`: High-contrast Crimson `#8C2622` on `#F7E2E0` with `#A63A35` border.

### Refined Glass Material System
- **Tier 1 — Strong Glass (`glass-strong` & Sidebar):**
  - Sidebar uses a Deep Teal (`#174C4A` to `#123D3B`) translucent gradient with `backdrop-filter: blur(24px)`, subtle white/champagne rim highlights, and soft ambient elevation.
  - Primary summary panels and modal containers use Soft Ivory (`#FFFEFA` at `74%–88%` opacity) blended with Subtle Teal (`#EAF1ED`), `backdrop-filter: blur(20px)`, and a `1px` `#E3E0D6` / translucent white border.
- **Tier 2 — Moderate Glass (`glass` & `glass-inset`):**
  - Contextual cards, search bars, and secondary panels use restrained translucency (`58%–76%` `#FFFEFA`) with `16px` backdrop blur and thin `#E3E0D6` borders.
- **Tier 3 — Solid Readability Surfaces (`surface`):**
  - Findings tables, document excerpts, and evidence viewers use `97%` opaque Soft Ivory (`#FFFEFA`) with `#E3E0D6` borders so dense text and citations remain effortless to read.

### Accessibility & Contrast Evaluation
- **Primary Text Contrast:** Charcoal `#263331` on Soft Ivory `#FFFEFA` yields **13.08:1** (Exceeds WCAG AAA) and on Warm Porcelain `#F4F1E9` yields **11.83:1** (Exceeds WCAG AAA).
- **Secondary Text Contrast:** Secondary Text `#64716D` on Soft Ivory `#FFFEFA` yields **4.97:1** (Passes WCAG AA) and on Warm Porcelain `#F4F1E9` yields **4.50:1** (Passes WCAG AA). Lead secondary text `#43524E` on Warm Porcelain yields **7.42:1** (Exceeds WCAG AAA).
- **Primary Brand Contrast:** Deep Teal `#174C4A` with `#FFFEFA` text yields **9.38:1** (Exceeds WCAG AAA). Hover Primary `#123D3B` with `#FFFEFA` text yields **11.49:1** (Exceeds WCAG AAA).

---

## 7. Comprehensive Comparison Matrix

| Evaluation Dimension | 1. Forest Green & Emerald *(Archived)* | 2. Navy & Teal *(Archived)* | 3. Charcoal & Warm Neutral *(Archived)* | 4. Ivory & Cobalt *(Archived)* | 5. Deep Teal × Champagne — Refined Glass *(OFFICIAL)* |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Status** | Archived Alternative | Archived Alternative | Archived Alternative | Archived Alternative | **Official Selection** |
| **Visual Personality** | Institutional audit registry | Structured, technical observatory | Architectural, editorial precision | Modern clinical, Swiss precision | Sophisticated, analytical, trustworthy, modern |
| **Brand Tone** | Traditional governance | Operational systems monitoring | Bespoke intellectual governance | Modern diagnostic verification | Precision enterprise intelligence & verification |
| **Semantic Safety** | **Moderate:** Needs distance between forest & emerald | **High:** Navy/Teal avoids status clashes | **Exceptional:** Monochrome base | **High:** Isolates blue from violet triage | **High:** Deep Teal + sparing Champagne isolates status & severity channels |
| **Surface Materiality** | Flat paper cards | Sharp technical modules | Tonal stone planes | Crisp solid/glass cards | **3-tier Refined Glass + solid Soft Ivory reading planes** |
| **Risk of AI/SaaS Cliché** | Zero | Low-Moderate | Zero | Low | **Zero:** Avoids neon glow, purple gradients, and generic SaaS tropes |
| **Verified Primary Contrast** | `#191F1C` on `#F9F9F6`: **15.88:1** (AAA) | `#020617` on `#F8FAFC`: **19.28:1** (AAA) | `#0C0A09` on `#F5F5F4`: **18.11:1** (AAA) | `#0F172A` on `#FDFDFD`: **17.55:1** (AAA) | `#263331` on `#FFFEFA`: **13.08:1** (AAA) |
| **Verified Secondary Contrast** | `#53635B` on `#F9F9F6`: **6.03:1** (AA) | `#64748B` on `#F8FAFC`: **4.55:1** (AA) | `#57534E` on `#F5F5F4`: **6.99:1** (AA) | `#475569` on `#FDFDFD`: **7.45:1** (AAA) | `#64716D` on `#FFFEFA`: **4.97:1** (AA) |

---

## 8. Assumptions and Design Risks

1. **Assumption of Document Structure & Length:**
   - *Assumption:* Incident reports, SOPs, and templates contain structured sections with identifiable paragraphs or line ranges.
   - *Risk:* Real-world incident reports may be poorly formatted or unstructured. The UI must accommodate messy text citations and gracefully handle excerpts of varying lengths in the evidence drawer without breaking card layouts.
2. **Cognitive Load in Dual Classification:**
   - *Assumption:* Users can quickly parse two distinct labels (`Status` and `Severity`) for each finding.
   - *Risk:* Displaying two badges per row across dozens of findings can create severe visual clutter. Badge styling must use quiet, legible tokens (e.g., text label + subtle micro-dot or signal bars) rather than heavily saturated, competing colored blocks.
3. **Decoupling "Not Found" from "Critical Severity":**
   - *Assumption:* Reviewers understand that missing evidence does not equal an automatic failure or critical breach.
   - *Risk:* If the UI visually screams "red" whenever evidence is not found, it could bias the reviewer toward assuming operational negligence. The UI must keep status and severity visually distinct.
4. **Restrained Champagne & Glass Usage:**
   - *Assumption:* Champagne (`#D5B77A`) and glass translucency elevate perceived craftsmanship without distracting from audit tasks.
   - *Risk:* Overusing metallic champagne tones or heavy blur on data tables can degrade readability and feel decorative. Champagne must remain a sparing focal accent while dense content stays on solid Soft Ivory (`#FFFEFA`) surfaces.

---

## 9. Official Decision & Rationale: Direction 5 (Deep Teal × Champagne — Refined Glass)

### Selected Direction: **Direction 5: Deep Teal × Champagne — "Refined Glass"**

#### Decision Rationale:
1. **Authority Without Generic SaaS Clichés:**
   - Pairing Deep Teal (`#174C4A`) and Muted Teal (`#477C76`) with Warm Porcelain (`#F4F1E9`) and Soft Ivory (`#FFFEFA`) gives DocuGuard AI a distinctive, trustworthy, and analytical identity that stands apart from both generic blue SaaS templates and purple-neon AI dashboards.
2. **Warm, Fatigue-Free Reading Environment:**
   - Warm Porcelain (`#F4F1E9`) and Soft Ivory (`#FFFEFA`) eliminate the harsh glare of pure white screens during extended multi-document SOP and incident report reviews while maintaining WCAG AAA primary text contrast (`13.08:1`) and WCAG AA secondary contrast (`4.97:1`).
3. **Selective Refined Glass Depth:**
   - Applying layered translucency (`glass`, `glass-strong`, `glass-inset`) to structural and summary containers while keeping findings tables, report excerpts, and evidence panels on near-solid Soft Ivory (`surface`) achieves modern depth without sacrificing legibility.
4. **Disciplined Accent & Semantic Isolation:**
   - Champagne (`#D5B77A`) is reserved strictly for subtle focal highlights (such as active navigation indicators and secondary progress arcs), while independent semantic tokens govern `Fulfilled`, `Partially Fulfilled`, `Not Found`, `Needs Review`, and the four severity levels (`Informational`, `Minor`, `Major`, `Critical`).
