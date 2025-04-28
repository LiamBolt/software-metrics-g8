## Goal-Question-Indicator-Metric (GQ(I)M) Process Applied to the Homework Portal

This README documents the full application of the **GQ(I)M (Goal-Question-Indicator-Metric)** methodology to the `software-metrics-g8` Homework Portal. We systematically follow all 10 GQ(I)M steps, deriving measurement goals from business objectives, defining questions, indicators, measures, and an actionable plan. Diagrams illustrate goal hierarchies and traceability.

---

## 1. Identify Business Goals (Step 1)

**Primary Business Goal (BG1):**
> Facilitate secure, role-based homework distribution and management between teachers and parents, ensuring efficient file handling.

**Definition (using template):**
- **Purpose:** Facilitate secure, role-based homework distribution and management
- **Object:** Homework Portal
- **Aspect (Perspective):** Efficiency and user satisfaction from the viewpoint of parents, teachers, and administrators.

**Output:** A clearly defined business goal to guide all subsequent measurement activities.

---

## 2. Identify What to Know (Step 2)

We derive what must be known to assess achievement of BG1 by brainstorming questions:

| ID  | Question                                                 | Perspective    |
|-----|----------------------------------------------------------|----------------|
| Q1  | What is the average time from upload of the homework and download?| Teachers|
| Q2  | How often do parents log in to check feedback?           | parent        |
| Q3  | What percentage of assignments are uploaded on time?    | parent/Portal |
| Q4  | Which features (upload, comments) are most used?         | Product Team  |

**Output:** Entity–Question checklist capturing key information needs.

---

## 3. Identify Subgoals (Step 3)

Group related questions to form subgoals:

- **Subgoal MG1:** Minimize upload turnaround time (addresses Q1)
- **Subgoal MG2:** Increase parent interaction with feedback (Q2, Q4)
- **Subgoal MG3:** Maximize on-time uploads (Q3)

**Diagram: Goal Decomposition**
```
BG1: Improve engagement & reduce turnaround
├─ MG1: Minimize grading turnaround
├─ MG2: Increase feedback interaction
└─ MG3: Maximize on-time submissions
```

---

## 4. Identify Entities & Attributes (Step 4)

For each subgoal, extract entities and their measurable attributes.

| Subgoal | Question                          | Entity           | Attributes                                      |
|---------|-----------------------------------|------------------|-------------------------------------------------|
| MG1     | Q1: turnaround time               | Upload       | upload_timestamp          |
| MG2     | Q2: login frequency               | Parent Account  | login_timestamp, feature_used                   |
| MG2     | Q4: feature usage                 | Feature Module   | module_name, usage_count                        |
| MG3     | Q3: on-time rate                  | Assignment       | due_date, uploads_timestamp                  |

**Output:** Candidate attributes that will become measures.

---

## 5. Formalize Measurement Goals (Step 5)

Convert subgoals into formal measurement goals (MG):

| MG ID | Object        | Purpose      | Focus       | Viewpoint    | Environment  |
|-------|---------------|--------------|-------------|--------------|--------------|
| MG1   | Upload    | Control      | Turnaround  | Teacher   | Production   |
| MG2a  | Parent Login  | Understand   | Frequency   | Parent       | Production   |
| MG2b  | Feature Module| Understand   | Usage       | Product Team | Production   |
| MG3   | Assignment    | Control      | Timeliness  | Teacher   | Production   |

---

## 6. Identify Indicators (Step 6)

Define indicators that reflect each MG:

| MG   | Indicator ID | Indicator Definition                                         |
|------|--------------|--------------------------------------------------------------|
| MG1  | I1           | Average grading turnaround time (hours)                      |
| MG2a | I2           | Average daily logins per parent                              |
| MG2b | I3           | Distribution of feature usage counts                         |
| MG3  | I4           | Percentage of assignments submitted on or before due date    |

---

## 7. Identify Data Elements (Step 7)

Specify raw data elements needed:

| Indicator | Data Elements                                               |
|-----------|-------------------------------------------------------------|
| I1        | upload_timestamp                      |
| I2        | login_timestamp, parent_id                                  |
| I3        | module_name, usage_event_timestamp                          |
| I4        | assignment_due_date, upload_timestamp                   |

---

## 8. Define Measures (Step 8)

Operational definitions:

- **Measure M1 (TurnaroundTime):** graded_timestamp − submission_timestamp, in hours.
- **Measure M2 (LoginCount):** count(login_timestamp) per parent per day.
- **Measure M3 (FeatureUsage):** count(usage_event) grouped by module_name.
- **Measure M4 (OnTimeRate):** (count of uploads where upload_timestamp ≤ due_date) ÷ total submissions × 100%.

---

## 9. Identify Actions (Step 9)

Plan actions to collect and analyze measures:

| Measure | Action Item                                                 | Owner          | Schedule      |
|---------|-------------------------------------------------------------|----------------|---------------|
| M1      | Extract timestamps from submissions DB                     | Dev Team       | Weekly ETL    |
| M2, M3  | Instrument login and feature modules for event logging      | Dev Team       | Immediate     |
| M4      | Configure report query for upload timeliness               | Analytics Team | Bi-weekly     |

---

## 10. Prepare Implementation Plan (Step 10)

**Measurement Implementation Plan:**

1. **Objective:** Enable data-driven improvements to portal responsiveness and engagement.
2. **Scope:** All parent and instructor interactions within Homework Portal v1.0.
3. **Activities & Timeline:**
   - Week 1: Instrument logging; validate data collection.  
   - Week 2–3: Run ETL jobs; produce initial indicator dashboards.  
   - Week 4: Review results with stakeholders; refine measures.
4. **Responsibilities:**  
   - Dev Team: Logging, ETL pipeline.  
   - Analytics Team: Dashboard creation, indicator analysis.  
   - Product Owner: Stakeholder reviews, action tracking.
5. **Traceability:** All actions and indicators mapped back to BG1 via MG1–MG3.

---

### Summary
By following GQ(I)M’s 10‑step process, we establish a rigorous measurement framework that directly maps to enhancements in the parent‑teacher workflow—streamlining assignment distribution, feedback loops, and file management—and lays out a clear blueprint for data‑driven improvement in the Homework Portal.

*End of GQ(I)M analysis for the Homework Portal.*

