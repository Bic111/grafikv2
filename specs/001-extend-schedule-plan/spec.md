# Feature Specification: Plan 2 – WorkSchedule PL Expansion

**Feature Branch**: `[001-extend-schedule-plan]`  
**Created**: 2025-11-09  
**Status**: Draft  
**Input**: User description: "Plan 2 – Kontynuacja rozwoju WorkSchedule PL obejmująca dokumentację, OR-Tools, UI i finalizację."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate compliant monthly schedules (Priority: P1)

A single trusted scheduler creates the monthly staff plan that respects every applicable labor-law rule and internal staffing policy without reverting to spreadsheets.

**Why this priority**: Compliance breaches carry legal and financial risk; producing a compliant roster is the core value of the system.

**Independent Test**: Request a schedule for an upcoming month with recorded rules and staffing templates, verify the resulting plan passes all validations and highlights any soft-rule deviations.

**Acceptance Scenarios**:

1. **Given** a complete set of codified labor-law rules and staffing templates for the store, **When** the operations lead generates a monthly schedule for a selected month, **Then** the system produces a schedule that satisfies every mandatory rest, hour-limit, and staffing constraint without blocking conflicts.
2. **Given** the generator identifies soft-rule tension (e.g., preference conflicts or uneven rotations), **When** the operations lead views the results, **Then** the interface displays prioritized validation issues with context so the lead can decide to accept or adjust assignments.

---

### User Story 2 - Configure rules, holidays, and generator parameters (Priority: P2)

The same scheduler curates the rule catalog, holiday calendar, staffing requirements, and optimization weights so the generator stays aligned with business policy.

**Why this priority**: Accurate configuration is required before any compliant schedule can be generated, and the business needs autonomy to adjust policies without code changes.

**Independent Test**: Update a holiday entry, modify staffing minimums for a role, adjust penalty weights, and confirm the changes are reflected in the next generated schedule and validation run.

**Acceptance Scenarios**:

1. **Given** the specialist records a new public holiday with reduced staffing levels, **When** a schedule covering that date is generated, **Then** the affected shifts automatically apply the revised staffing targets and flag any shortages.
2. **Given** the specialist increases the penalty weight for consecutive night shifts, **When** the next schedule is generated, **Then** the optimization diagnostics show the updated weighting and the resulting schedule reduces consecutive night assignments.

---

### User Story 3 - Monitor outcomes and distribute deliverables (Priority: P3)

That scheduler reviews dashboards, exports reports, and packages an up-to-date application bundle for deployment to each workstation.

**Why this priority**: Stakeholders need visibility into schedule quality and a simple way to distribute the solution to new locations.

**Independent Test**: Load the dashboard for a completed month, export compliance and staffing reports, and assemble the distribution bundle using provided instructions.

**Acceptance Scenarios**:

1. **Given** a generated schedule with recorded validations, **When** the manager opens the dashboard, **Then** the system surfaces key metrics (coverage, overtime, alerts) and highlights days requiring attention.
2. **Given** the manager runs the distribution workflow, **When** the package is produced, **Then** it contains the backend, built frontend, configuration files, and startup instructions suitable for installation on a workstation without developer tooling.

### Edge Cases

- When rule constraints conflict and no feasible schedule exists, the system must explain which rules collide and suggest the smallest relaxations to try.
- When the holiday calendar is updated after a schedule was generated, users must be prompted to regenerate or accept the impact with documented acknowledgement.
- When imported historical patterns contradict manual edits, the system must highlight the discrepancy and let the user choose the authoritative source.
- When staffing requirements vary for partial weeks (e.g., store opening mid-month), the generator must respect incomplete periods without assuming full-week data.
- When the distribution package is opened on a machine without internet access, the instructions must include offline prerequisites and troubleshooting guidance.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The platform MUST maintain a structured catalog of labor-law work-time rules that can be reviewed by stakeholders and consumed by scheduling validation and generation processes.
- **FR-002**: Authorized users MUST be able to manage a holiday calendar, including staffing impact per role and shift, and have those changes reflected in subsequent schedules.
- **FR-003**: The system MUST allow definition of staffing requirements per day of week, shift, and role, including minimum and target coverage levels.
- **FR-004**: The platform MUST capture employee preferences and reference historical staffing patterns so that optimization weighting can balance fairness and operational continuity.
- **FR-005**: Users MUST be able to initiate schedule generation by selecting the desired optimization mode and must receive diagnostics covering constraint satisfaction, penalty scores, and runtime details.
- **FR-006**: Every generated schedule MUST run through automated validation against all recorded rules and requirements, producing a human-readable summary of any blocking or advisory issues.
- **FR-007**: The user interface MUST provide dashboards and drill-down views that summarize staffing coverage, overtime exposure, compliance alerts, and upcoming absences for the selected period.
- **FR-008**: Reporting capabilities MUST include exportable summaries (e.g., CSV or printable formats) for worked hours, role distribution, absence usage, and validation outcomes.
- **FR-009**: Configuration screens MUST enable adjustment of generator parameters (penalties, weights, thresholds) without requiring code deployments, ensuring business teams can tune the optimizer.
- **FR-010**: The delivery workflow MUST produce a documented installation package with environment selection (development vs. production) so new locations can deploy the solution without engineering support.
- **FR-011**: The initiative MUST deliver and maintain a formal labor-law rule compendium (`ANALIZA_KP.md`) that translates statutory requirements into unambiguous logical conditions referenced by validation and optimization teams.
- **FR-012**: The API contract (`openapi.yaml`) MUST be expanded and kept current for every exposed endpoint, enabling consumers to rely on an authoritative, version-controlled specification.
- **FR-013**: A comprehensive, shareable entity-relationship representation (diagram image or Mermaid markdown) MUST describe the canonical data model and be updated alongside schema changes.
- **FR-014**: UX artifacts (wireframes or mockups) MUST exist for dashboard, reporting, holiday management, generator configuration, and employee preference flows so stakeholders can review and sign off on interface changes before implementation.

### Key Entities

- **LaborLawRule**: Defines a specific legal or policy constraint (rest periods, weekly limits, night-work rules) with parameters used by validation and optimization.
- **Holiday**: Represents dates with special staffing considerations, including impact on required coverage and pay rules.
- **StaffingRequirementTemplate**: Captures required staffing counts per role, shift, and day-type, serving as input for generation and validation.
- **GeneratorParameter**: Stores adjustable weights, penalties, and thresholds that guide the optimization engine.
- **EmployeePreference**: Records individual availability, preferred shifts, and avoidance requests considered during schedule generation.
- **ScheduleScenario**: Holds generated schedules, associated diagnostics, and metadata describing the optimization run.
- **ValidationIssue**: Describes compliance or soft-rule findings tied to schedule entries, including severity and remediation guidance.
- **ReportSnapshot**: Aggregated metrics and visualizations produced for dashboards and exported reports.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of generated schedules approved for deployment must pass all mandatory labor-law validations without manual overrides.
- **SC-002**: Operations leads must be able to configure parameters and produce a compliant schedule for a standard store with no more than five manual adjustments per month.
- **SC-003**: Dashboard and reporting views must enable managers to identify compliance or staffing anomalies during review sessions without additional analytics tooling.
- **SC-004**: The documented distribution package must enable a new location to install and run the application using the provided instructions without developer intervention.

## Assumptions & Dependencies

- Labor-law rule definitions and updates are supplied by the company’s compliance team and approved before they are entered into the system.
- Employee roster data, roles, and contractual hours are maintained accurately in the existing master data sources feeding the application.
- Historical staffing patterns and preference data are available and of sufficient quality to influence optimization without introducing bias.
- Target deployment environments provide the necessary runtime prerequisites (e.g., operating system, basic runtime libraries) for the packaged application.
- Stakeholders will review and approve documentation artifacts (ANALIZA_KP, OpenAPI, ERD, mockups) on a recurring cadence to keep them synchronized with product evolution.
- The application operates in single-user mode: one trusted person administers configuration, generates schedules, and consumes reports without requiring user accounts or role-based access control.

## Clarifications

### Session 2025-11-09

- Q: How do we divide permissions between configuring rules, generating schedules, and viewing reports? → A: All responsibilities fall to a single trusted user; no account management or role separation is required.
