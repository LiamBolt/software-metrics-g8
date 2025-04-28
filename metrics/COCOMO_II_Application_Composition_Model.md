## COCOMO II Application Composition Model Applied to the Homework Portal

This README applies the **COCOMO II Application Composition Model** to the `software-metrics-g8` Homework Portal. We follow the standard Object-Point counting procedure: 1) inventory all screens (EJS views) and reports, 2) classify each by complexity, 3) compute the weighted Object-Point (OP) total, 4) adjust for reuse, and 5) estimate effort using a productivity rate.

---

## 1. Object-Point Counting Procedure

COCOMO II defines the following steps for the Application Composition model:

1. **Assess Object Counts**: Count the number of screens, reports, and 3GL components in the application.
2. **Classify Complexity**: For each screen/report, classify as **Simple**, **Medium**, or **Difficult** based on:
   - Number of views contained
   - Number and source of data tables (server vs. client)
3. **Weight by Complexity**: Apply weights to each object instance:

   | Object Type | Simple | Medium | Difficult |
   |-------------|:------:|:------:|:--------:|
   | Screen      |   1    |   2    |     3    |
   | Report      |   2    |   5    |     8    |
   | 3GL Component | -    |   -    |    10    |

   ([cs.montana.edu](https://www.cs.montana.edu/courses/spring2004/352/public/cocomo/modelman.pdf))

4. **Compute Total OP**: Sum all weighted counts to get the Object-Point count (OP).
5. **Adjust for Reuse**: OP<sub>new</sub> = OP × (1 − %reuse).
6. **Select Productivity Rate (PROD)** based on developer and ICASE tool maturity:

   | Experience / Maturity       | Very Low | Low | Nominal | High | Very High |
   |-----------------------------|:--------:|:---:|:-------:|:----:|:---------:|
   | ICASE maturity & developers |     4    |  7  |    13   |  25  |     50    |

   ([cs.montana.edu](https://www.cs.montana.edu/courses/spring2004/352/public/cocomo/modelman.pdf))

7. **Effort Estimation**:  
   Effort (PM) = NOP/PROD

---

## 2. Inventory of Screens and Reports

**Screens** (EJS views): The `views` folder contains **63** distinct `.ejs` templates, each representing a screen in the portal (login, sign-up, grade dashboards, subject resources, upload/download pages, admin dashboard, etc.) ([github.com](https://github.com/LiamBolt/software-metrics-g8/tree/main/views))

**Reports**: There are no dedicated report pages in this portal (all interactions occur via screens, not report-generation views), so **0** reports.

**3GL Components**: No custom third‑generation-language modules counted separately (all logic resides in Node.js controllers), so **0** components.

---

## 3. Complexity Classification

All screens in this portal are single‑view, thin‑client interfaces with minimal data‑table interactions (each page connects to at most one server table and zero client tables). According to the complexity matrix:

| #Views Contained | Server Tables | Client Tables | Classification | Weight |
|------------------|:-------------:|:-------------:|:--------------:|:------:|
| &lt; 3            | &lt; 2         | &lt; 3         | Simple         | 1      |

Thus, **all 63 screens** are classified as **Simple** (weight = 1). ([cs.montana.edu](https://www.cs.montana.edu/courses/spring2004/352/public/cocomo/modelman.pdf))

_No screens meet criteria for Medium or Difficult complexity._

---

## 4. Object-Point Calculation

| Object Type | Simple Count | Medium Count | Difficult Count | Weight(Simple) | Weight(Medium) | Weight(Difficult) | OP Contribution |
|-------------|:------------:|:------------:|:---------------:|:--------------:|:--------------:|:----------------:|:---------------:|
| Screens     |      63      |      0       |        0        |       1        |       2        |        3         |      63 × 1 = 63 |
| Reports     |      0       |      0       |        0        |       2        |       5        |        8         |        0        |
| 3GL Comp.   |      0       |      0       |        0        |       –        |       –        |       10         |        0        |

**Total Unadjusted OP** = 63 + 0 + 0 = **63**

Assuming **0% reuse** (brand-new portal), **New OP (NOP)** = 63 × (1 − 0) = **63**.

---

## 5. Productivity & Effort Estimation

Assuming a **Nominal** productivity rate (PROD = 13 NOP/PM) for a small team familiar with web frameworks:  

| Experience Level | PROD (NOP/PM) |
|:----------------:|:-------------:|
| Nominal          |      13       |

Then estimated effort in Person‑Months (PM) is:

Effort = NOP/PROD = 63/13 ~ 4.85 PM

This equates to roughly **5 person‑months** of development effort.

---

## 6. Assumptions & Notes

- **Screens Only**: No separate reports or 3GL components were identified, so OP arises solely from screens.
- **Reuse**: We assumed 0% reuse; if existing modules or templates are reused, adjust NOP accordingly.
- **Productivity**: We chose Nominal (13 NOP/PM); adjust if team experience or tooling maturity differ.


*End of COCOMO II Application Composition analysis for the Homework Portal.*

