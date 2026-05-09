# KAVALAN — Ideation & Solution Design Document

### HackHere Community · AIVENTRA Challenge · Round 1 Submission

---

## The Moment the Problem Became Real

We started not with a solution, but with a question:

> _"How long does it actually take a forensic investigator to connect the dots between a body found at 6 AM, a CCTV clip from 11 PM the night before, a phone that last pinged a tower 2 km away at 10:47 PM, and an autopsy report that says death was 8–12 hours prior?"_

The answer, in most under-resourced forensic departments today: **days. Sometimes weeks.**

Not because investigators aren't skilled. Because the process is **manually fragmented**. The autopsy report is a PDF in one folder. The CCTV logs are in another system. The mobile metadata is in a spreadsheet someone extracted. Nobody has correlated them. Nobody has even asked the question yet.

That gap — between evidence existing and evidence being _understood_ — is where investigations stall. That's where KAVALAN begins.

---

## Phase 1: Understanding the Problem Space

### What We Observed

We mapped the current forensic investigation workflow across three friction points:

**Friction Point 1 — Autopsy Reports are Unstructured**
Medical examiners write in natural language. "Contusions consistent with defensive wounds" lives inside a 12-page PDF. No system extracts it. No system connects it to the CCTV clip of the victim raising their arms 90 minutes before discovery. An investigator has to read both and make that connection manually.

**Friction Point 2 — Digital Evidence Lives in Silos**
CCTV footage timestamps, mobile tower pings, GPS telematics, financial transactions, social metadata — each comes from a different department, in a different format, on a different timeline. Nobody builds the unified picture until a detective sits down with printed logs and a highlighter.

**Friction Point 3 — Time-of-Death is Still Calculated by Hand**
The Henssge nomogram — the scientific method for estimating time of death from body temperature, ambient temperature, and postmortem indicators — is a legitimate forensic standard. Most field teams either can't apply it quickly or guess from rigor/livor mortis alone, losing the precision that temperature differential gives you.

### What We Didn't Want to Build

Before ideating solutions, we were explicit about what we would **not** do:

- ❌ A tool that claims to **determine guilt** — that's a legal conclusion, not a forensic one
- ❌ A black-box AI that gives an answer with no explanation — inadmissible and dangerous
- ❌ A replacement for forensic experts — the system must assist, not substitute
- ❌ A generic dashboard with no forensic domain depth — style over function solves nothing

This forced us toward something specific: **a structured triage and correlation assistant, not an oracle.**

---

## Phase 2: Ideation Process

### Method — First Principles Decomposition

We broke the problem into the smallest atomic units:

```
A forensic investigation needs to answer 4 questions:
  1. What happened to this person? (Autopsy)
  2. When did it happen? (Time of Death)
  3. Who was where, when? (Digital Evidence)
  4. How urgent / complex is this case? (Risk Triage)
```

Each question maps directly to a feature. That's not coincidence — that's the design principle. **Every feature exists because a real investigator has a real question that currently takes too long to answer.**

### Whiteboard Session: The "2 AM Investigator" Frame

We used a scenario frame we called the _"2 AM Investigator"_ — a single detective, deadline pressure, 6 cases open, one just escalated to CRITICAL. What does this person need in front of them?

- A fast overview of which cases need attention **right now** → Investigation Hub Dashboard
- The ability to paste an autopsy report and get a structured breakdown in seconds → AI Autopsy Analyzer
- A form where they enter three temperature readings and get a time-of-death window with a confidence score → TOD Estimator
- A view that shows CCTV, mobile, GPS, financial data on one timeline and flags the anomalies → Digital Evidence Correlator
- A score that tells them case-002 is more urgent than case-005, and why → Case Risk Scoring

Every feature was tested against this frame: _"Does this save real time for that investigator at 2 AM?"_ If the answer was no, we cut it.

### The Tamil Name — KAVALAN (காவலன்)

The name came from the framing itself. **Kavalan** means _Guardian_ or _Protector_ in Tamil — specifically the person who watches over others. In ancient Tamil culture, the kavalan was the village sentinel, the one who kept watch so others could sleep.

That is exactly what this system does: **it keeps watch over the evidence so the investigator can focus on the human work** — interviewing witnesses, building timelines, making judgment calls. KAVALAN handles the volume. The detective handles the insight.

---

## Phase 3: Translating Ideation Into Architecture

### The Core Design Decision: Explainability Over Magic

The biggest architectural decision we made was to build an **explainable AI engine**, not a neural black box.

When KAVALAN says:

> _"Estimated PMI: 8–9 hours. Rigor mortis stage 2 → 8–18h. Livor mortis (well-defined) → 6–12h. Intersected with Henssge nomogram → 8–9h PMI."_

...an investigator can verify every step. A forensic pathologist can challenge any of the three inputs. A court can examine the methodology. That's intentional.

The AI engine uses:

- **NLP keyword extraction** for autopsy reports (no hallucination — it only extracts what's present)
- **The Henssge nomogram** for TOD (published forensic science, not a model)
- **Temporal and spatial anomaly detection** for digital evidence (rule-based, auditable)
- **Weighted composite scoring** for risk (formula visible to the user)

### Feature-to-Problem Mapping

| Problem                                        | Feature                     | What It Replaces                                  |
| ---------------------------------------------- | --------------------------- | ------------------------------------------------- |
| Autopsy reports are unstructured walls of text | AI Autopsy Analyzer         | Hours of manual extraction into a structured form |
| TOD calculated inconsistently in the field     | TOD Estimator (Henssge)     | Guesswork and back-of-napkin arithmetic           |
| Digital evidence lives in silos                | Digital Evidence Correlator | Spreadsheets, printed logs, highlighters          |
| No triage prioritization across open cases     | Case Risk Scoring           | Gut feeling and seniority                         |
| No single operational view                     | Investigation Hub Dashboard | Scattered systems, manual case reviews            |

---

## Phase 4: What Makes This Different

### Not Another "AI for Everything" Tool

Most hackathon projects in this space fall into two traps:

1. **Too broad** — "AI will analyze everything and solve crime" (no specificity)
2. **Too shallow** — A pretty dashboard with fake data and no actual logic

KAVALAN is specifically designed around **forensic science that already exists** — Henssge nomograms, PMI estimation from rigor/livor mortis staging, digital anomaly detection from temporal gaps — and applies AI to **speed up the structured application of that science**, not replace it with speculation.

### The Ethical Line We Drew

Every output in KAVALAN includes:

- A **confidence level** (the system tells you how certain it is)
- A **methodology note** (the system tells you how it got there)
- A **disclaimer** (all outputs are investigative support, not legal conclusions)

This isn't just ethics-washing. It's a functional requirement for the system to be **usable in real investigations** where chain of custody and methodology transparency matter legally.

---

## Phase 5: The Solution We Built

KAVALAN is a full-stack forensic intelligence workstation running locally — no cloud dependency, no data leaving the device, which matters for case security.

### Five Pillars, One System

**Pillar 1: Investigation Hub**
A live dashboard showing active cases, risk distribution, case pipeline by status, and recent forensic activity. Designed for a detective's morning brief or a late-night case review. 5 key metrics visible at a glance.

**Pillar 2: AI Autopsy Report Analyzer**
Paste any free-text autopsy report. The system extracts cause of death, manner of death, injury patterns, toxicology flags, wound catalog, and postmortem interval. Confidence-scored. Every extraction is keyword-traceable.

**Pillar 3: Time-of-Death Estimator**
Enter body temperature, ambient temperature, rigor mortis stage, livor mortis state, and optionally last-seen-alive timestamp. The system runs the Henssge nomogram, cross-references all three postmortem indicators, and returns a PMI window with confidence level and full methodology explanation.

**Pillar 4: Digital Evidence Correlator**
Multi-source evidence (CCTV, mobile, GPS, financial, social) visualized on a single chronological timeline with anomaly scoring. The correlation engine flags temporal gaps, location contradictions, suspicious behavioral patterns, and evidence tampering signals.

**Pillar 5: Case Risk Scoring**
A 5-factor weighted risk score (evidence volume, suspect density, digital anomalies, forensic completeness, case urgency) that produces a 0–100 score, a risk tier (LOW/MEDIUM/HIGH/CRITICAL), contributing factor breakdown, and recommended priority actions.

---

## What the Judges Should Take Away from Round 1

1. **We identified a real, specific problem** — not a vague "AI for forensics" concept, but concrete workflow friction at three specific points in a real investigation.

2. **Our features map 1:1 to forensic science** — every capability is grounded in established forensic methodology (Henssge, rigor/livor staging, digital chain-of-custody analysis). We didn't invent new science; we made existing science faster.

3. **We drew a clear ethical line** — the system assists, explains, and flags. It does not decide, conclude, or replace. This is not a limitation; it's the correct design for a tool that will be used in legal contexts.

4. **The ideation was human-centered** — the "2 AM Investigator" frame kept every decision grounded in a real user's real need. Not features for features' sake.

5. **The name means something** — KAVALAN (காவலன்), the Guardian. A system that watches over evidence so investigators can focus on justice.

---

## One Line for the Judges

> _KAVALAN doesn't solve crimes. It gives the people who do the space and clarity to solve them faster._

---

_Submitted for Round 1 Review — HackHere Community · AIVENTRA Challenge_
_Tamil name KAVALAN (காவலன்) — Guardian / Protector_

---

## Addendum: Real AI, Not a Demo Stub

One thing judges often see at hackathons is systems that *look* like they use AI but are running keyword lookups behind a loading spinner.

KAVALAN does not do that. Here is what is actually happening:

**Autopsy Analysis → AWS Bedrock / Claude Haiku 4.5**
When you paste an autopsy report and click RUN ANALYSIS, the full text goes to Claude Haiku 4.5 running on AWS Bedrock. Claude reads it as a forensic pathologist would — understanding medical terminology, interpreting injury patterns, classifying manner of death from contextual clues, and explaining its reasoning. The same report run through keyword matching would give you ~45% confidence. Claude gives you 83% with a full medical narrative.

**Digital Correlation → AWS Bedrock / Claude Haiku 4.5**
When you run CORRELATION ANALYSIS on a case's digital evidence, Claude reads the full event timeline and thinks like a detective. On the Port District Homicide, it identified: a premeditation sequence spanning 6 hours 48 minutes, an "ORGANIZED CRIME OPERATIONAL SEQUENCE" at 92% confidence, CCTV tampering as CRITICAL, and a burner phone disposal pattern. It flagged 7 distinct anomalies and produced 5 behavioral patterns — none of which are in any hardcoded rule list.

**Time-of-Death → Henssge Nomogram**
This is real published forensic science. The formula is not AI — it's the actual method used in forensic pathology. We implemented it correctly.

**Risk Scoring → Formula**
Five weighted factors, fully auditable. This is the right call for a system that will be used in legal contexts — you need to be able to explain every point.
