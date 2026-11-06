# DocuGuard AI — Product Context & Requirements

## 1. Product Identity

- **Name:** DocuGuard AI
- **Tagline:** Check. Verify. Improve.
- **Product Type:** AI-assisted IT incident report review system.
- **Role & Boundary:**
  - DocuGuard AI operates strictly as a **first-pass reviewer** assisting human reviewers in checking the completeness and compliance of IT incident reports against user-provided Standard Operating Procedures (SOPs) and report templates.
  - **No Automatic Approval:** The AI does not possess authority to grant automatic approvals or final audits. Human reviewers retain full accountability and final decision-making power.

---

## 2. Core Workflow

The user provides three primary input documents:
1. **SOP Document:** Serves as the compliance requirement benchmark.
2. **Report Template:** Serves as the structural and mandatory completeness benchmark.
3. **Incident Report:** The target document under evaluation.

### End-to-End System Flow:
1. **Document Validation:** Validate file formats (PDF/DOCX) and size limits.
2. **Text Extraction:** Extract text content from valid digital PDF/DOCX files.
3. **Parsing:** Parse and index the SOP rules, template sections/fields, and report narrative.
4. **Independent Dual Evaluation:**
   - **SOP Compliance Check:** Evaluates adherence to operational guidelines, response times, escalation protocols, and mitigation actions specified in the SOP.
   - **Template Completeness Check:** Evaluates presence and thoroughness of required sections, data points, timelines, root-cause analyses, and action items defined by the template.
5. **Evidence Validation:** Pinpoint citations, quotes, and contextual evidence directly supporting each requirement, or explicitly document why evidence was not found.
6. **Finding Categorization:** Assign orthogonal fulfillment status and severity levels to each finding.
7. **Synthesis & Recommendations:** Generate the comprehensive review summary, evidence trail, and actionable improvement recommendations.
8. **Persistence:** Save review results, metadata, and timestamps for auditable history.
9. **Revision & Recheck:** Allow users to submit revised incident reports against the original benchmarks and run re-evaluations.
10. **Version Comparison:** Compare historical and revised evaluations to visualize resolved issues, persisting gaps, and new findings.

---

## 3. Important Product Rules

- **Strict Separation of Concerns:** SOP Compliance and Template Completeness must be presented in separate views or distinct sections—never conflated into a single generic score.
- **Evidence-Backed Findings:** Every single finding must include direct evidence (snippets, line/page references) or an explicit rationale clarifying why evidence was absent.
- **Fair Assumption of Missing Evidence:** The absence of evidence within the report does *not* automatically prove that an operational step failed to happen or constituted deliberate non-compliance; it simply denotes that evidence was not documented.
- **Human Triage for Ambiguity:** Ambiguous phrasing, conflicting details, or borderline compliance must be explicitly flagged as `Needs human review`.
- **Zero Automatic Approvals:** The system must never emit an automated sign-off, rubber-stamp, or "Passed" status that supersedes human review.
- **Human Accountability:** The human auditor/lead remains the final authority for sign-off.
- **Text-Only MVP Scope:** The MVP exclusively supports text-based digital PDF and DOCX files.
- **Out of Scope for MVP:** Optical Character Recognition (OCR), scanned image analysis, handwriting analysis, and direct ticketing/backend database synchronizations are strictly out of scope.

---

## 4. Finding Classification

Findings are evaluated on two **strictly independent (orthogonal)** dimensions. They must not be blended or combined into a single status label.

### A. Fulfillment Status (Status Pemenuhan)
- **Fulfilled:** Clear, unambiguous evidence demonstrates requirement satisfaction.
- **Partially Fulfilled:** Addressed in part, but missing required details, metrics, or corroborating information.
- **Not Found:** Required item or evidence is entirely absent from the report.
- **Not Applicable:** Criteria explicitly waived or irrelevant given the specific nature of the incident.
- **Needs Human Review:** Information is ambiguous, conflicting, or requires subjective engineering/management judgment.

### B. Severity (Tingkat Keparahan Temuan)
- **Informational:** Minor observation, formatting tip, or informational note; zero risk to compliance.
- **Minor:** Low operational or structural omission that should be polished but does not compromise the report integrity.
- **Major:** Significant omission or SOP violation that compromises incident transparency, RCA clarity, or accountability.
- **Critical:** Severe non-compliance or failure to document vital containment, escalation, or legal/security disclosures.

---

## 5. Main UI Areas

1. **Dashboard:**
   - High-level overview of recent reviews, compliance metrics, pending human reviews, and quick action entry points.
2. **New Review / Document Upload:**
   - Dedicated multi-file upload workspace for SOP, Report Template, and Incident Report with validation cues, file previews, and pre-check status.
3. **Review Processing:**
   - Transparent, step-based visual feedback showing current analysis phases (validation, extraction, SOP check, template check, evidence synthesis).
4. **Review Results:**
   - Primary review workspace featuring summary metrics, independent tabs/sections for SOP Compliance vs. Template Completeness, actionable recommendations, and filterable findings.
5. **Evidence Detail:**
   - Drill-down drawer or modal displaying granular citations, source quotes, exact document locations, and the AI rationale behind each finding.
6. **Review History & Version Comparison:**
   - Historical audit log of previous runs with side-by-side or differential tracking across document revisions (showing resolved vs. unresolved findings).

---

## 6. Design Objectives & Principles

- **Enterprise-Grade Compliance Aesthetics:** Must feel like an authoritative, high-integrity governance tool (akin to enterprise audit, legal, or security software)—not a casual chatbot, AI playground, or generic SaaS template.
- **Trust & Transparency:** AI reasoning and citations must be visible and verifiable, avoiding "black box" claims.
- **Strong Visual Hierarchy & Readability:** Dense tabular data, audit logs, and checklists must maintain high legibility, clean spacing, and well-structured typography.
- **Color & State Discipline:** Clear, distinguishable visual tokens for status (Fulfilled, Not Found, etc.) and severity (Critical, Major, Minor, Info) that do not create visual noise or confusion.
- **Streamlined Navigation:** Direct paths between high-level summaries and granular evidence snippets.
- **Desktop & Laptop Optimization:** Responsive design tailored for enterprise workstations (1280px–1920px+ displays).

---

## 7. Project Constraints & Environment

- **AI Development Environment:** Google Antigravity.
- **Design Tooling & Integration:** Figcraft MCP (connecting Antigravity with Figma).
- **Design Skill:** Impeccable (guiding UX design standards, design tokens, hierarchy, and interaction design).
- **Backend Architecture:** n8n workflow engine (developed and maintained separately).
- **Strict Scope Constraint:** Current focus is **UI/UX and design architecture only**. Do **not** modify or create n8n workflows, backend services, or live API integrations at this stage.

---

## 8. Open Questions & Ambiguities for UX Clarification

1. **Document Management & Presets:**
   - In a production environment, are SOPs and Templates uploaded fresh for *every* review, or will users select from a library of reusable pre-uploaded SOPs/Templates?
2. **Reviewer Decision & Sign-off Interaction:**
   - How does the human reviewer conclude the review? Should the UI provide manual status overrides (e.g., mark a "Not Found" item as "Accepted by Reviewer"), add reviewer notes, or generate an exported sign-off report (PDF/Markdown)?
3. **Version Comparison Scope & Presentation:**
   - Should version comparison emphasize a side-by-side document comparison, a diff table highlighting resolved/persisting/new findings, or a delta metric card (e.g., "+4 issues resolved, 1 remaining")?
4. **Incident Metadata Capture:**
   - Are incident metadata (Incident ID, Severity, Incident Date, Incident Commander/Reporter) entered manually on the upload screen or automatically parsed and displayed for human verification?
5. **Handling "Needs Human Review" Queue:**
   - Does the dashboard or results page need a dedicated quick-triage mode for findings marked `Needs human review` to help reviewers rapidly resolve ambiguities?
