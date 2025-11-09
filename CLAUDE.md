# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Specify template project - a specification and planning framework for software development. The project uses a structured approach to define, plan, and implement features through specifications.

### Key Directories

- `.specify/` - Core Specify infrastructure with scripts, templates, and memory files
- `.specify/scripts/powershell/` - PowerShell scripts for setting up plans, checking prerequisites, and creating features
- `.specify/templates/` - Templates for creating specifications, plans, and checklists
- `.specify/memory/` - Constitution and project guidelines
- `.github/prompts/` - AI prompt templates used for specification workflow
- `.droid/commands/` - Mirror of GitHub prompts for local development

## Development Workflow

This project uses the Specify framework, which follows a structured development lifecycle:

1. **Constitution** (`.specify/memory/constitution.md`) - Project principles and constraints
2. **Specification** - Features documented with requirements and acceptance criteria
3. **Planning** - Breaking down specifications into implementation tasks
4. **Implementation** - Building features based on approved plans
5. **Checklists** - Verification that implementations meet specifications

### Key Concepts

- **Specs Directory**: Features are organized in `specs/` folder with structure: `NNN-feature-name/` (e.g., `001-user-auth/`)
- **Agent Context**: PowerShell scripts (`.specify/scripts/powershell/`) manage feature context and setup
- **Templates**: Start new features by copying appropriate templates from `.specify/templates/`

## Important Files

- `.specify/memory/constitution.md` - Project constitution (defines core principles and development practices)
- `.specify/scripts/powershell/update-agent-context.ps1` - Updates feature context for AI agents
- `.specify/scripts/powershell/check-prerequisites.ps1` - Validates environment setup
- `.specify/scripts/powershell/create-new-feature.ps1` - Scaffolds new features

## Common Commands

Note: This template uses PowerShell scripts. Adapt commands to your shell environment.

```powershell
# Check if environment prerequisites are met
.\.specify\scripts\powershell\check-prerequisites.ps1

# Create a new feature with scaffolding
.\.specify\scripts\powershell\create-new-feature.ps1

# Update agent context for the current feature
.\.specify\scripts\powershell\update-agent-context.ps1
```

## Notes for AI Assistance

- Before implementing features, ensure there's an approved specification and plan
- Reference the constitution when making architectural decisions
- Use the template structure when creating new feature specs
- The project structure supports tracking of specifications, plans, and checklists alongside implementation
