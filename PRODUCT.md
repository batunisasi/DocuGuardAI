# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Figma (via Figcraft MCP for design system tokens, component libraries, and screen mockups); n8n backend workflow engine (managed and developed separately).

## Users

- **Primary User 1 — Incident Reporter / Author:** SRE, DevOps, or IT Operations engineer who drafts post-incident reports. Uses DocuGuard AI to run pre-checks against SOPs and templates, detect missing evidence, and iteratively polish reports prior to formal review.
- **Primary User 2 — Reviewer / Lead Auditor:** Incident Manager, SRE Lead, or IT Compliance/Governance Officer. Evaluates flagged findings, triages items marked `Needs human review`, inspects the evidence trail, adds reviewer annotations, and conducts final human sign-off and report export.

## Product Purpose

DocuGuard AI is an AI-assisted IT incident report review system functioning as an authoritative first-pass reviewer. It accelerates post-incident reviews by cross-checking reports against user-defined SOPs and report templates, validating evidence, categorizing gaps, and guiding revision loops—without ever claiming automatic sign-off authority.

## Positioning

An enterprise-grade document compliance and verification tool—fundamentally distinct from generic AI chatbots or basic document summarizers. It enforces strict audit transparency by evaluating SOP Compliance and Template Completeness through two distinct, orthogonal lenses, pairing every claim with explicit textual citations or verifiable explanations for missing evidence.

## Operating Context

- Post-incident post-mortem and review cycles in enterprise IT environments.
- Three-document core workflow: SOP (procedural standard), Report Template (structural requirement), and Incident Report (evaluated subject).
- High-stakes governance rituals where missing evidence or procedural deviations must be surfaced transparently without premature non-compliance accusations.
- Iterative recheck cycles comparing previous and updated document revisions to track resolution deltas.

## Capabilities and Constraints

- **Document Ingestion:** Text-based digital PDF and DOCX files only. OCR, scanned document analysis, and handwriting recognition are out of scope for MVP.
- **Evaluation Independence:** Separate evaluation engines and presentation layers for SOP Compliance vs. Template Completeness.
- **Orthogonal Finding Classification:**
  - *Fulfillment Status:* `Fulfilled`, `Partially fulfilled`, `Not found`, `Not applicable`, `Needs human review`.
  - *Severity Level:* `Informational`, `Minor`, `Major`, `Critical`.
- **Reviewer Interaction:** Interactive triage for ambiguous findings, reviewer annotations, and exportable verification records.
- **Boundary Constraint:** AI provides first-pass verification and recommendations; human reviewer holds final sign-off authority.
- **Development Constraint:** Focus strictly on UI/UX and Figma assets via Figcraft MCP. No changes or integrations to n8n workflows or backend code.

## Brand Commitments

- **Name:** DocuGuard AI
- **Tagline:** Check. Verify. Improve.
- **Tone & Demeanor:** Enterprise-grade compliance, institutional trust, precision, transparency, and clarity. Avoid playful, consumer, or chatbot-style metaphors.

## Evidence on Hand

- Core product requirements and workflow specification captured in [docs/product-context.md](docs/product-context.md).
- Confirmed absence of OCR or scanning pipelines in MVP.
- No fabricated customer names, benchmark numbers, or unsupported backend integrations.

## Product Principles

1. **Trust Through Traceability:** Every finding must provide concrete text evidence or explain exactly why evidence was not found.
2. **Strict Separation of Concerns:** Operational SOP compliance and structural template completeness serve different governance purposes and must remain separate.
3. **Uncompromising Human Authority:** AI flags and suggests; humans decide, annotate, and approve.
4. **Information Rigor Over Decoration:** Visual hierarchy, tabular readability, clear status badging, and scannability outrank ornamental visual effects.

## Accessibility & Inclusion

- Optimized for enterprise desktop and laptop screens (1280px to 1920px+).
- High visual distinction and WCAG AA contrast standards across orthogonal status and severity badges to prevent cognitive overload in dense data tables.
