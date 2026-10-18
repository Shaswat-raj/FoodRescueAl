# FoodRescue AI — Agent Instructions

These instructions apply to any AI agent or developer continuing work on this project.

## Before Starting Any Task
1. Read `architecture.md` to understand the full system design, data models, API contracts, and status transitions.
2. Read `TASKS.md` to see what is done, in progress, and pending. Do not redo completed work.
3. Inspect only files directly relevant to the task at hand.

## During Implementation
- Preserve all working implementations. Do not rewrite features that are already tested and working.
- Make targeted, minimal changes. Do not refactor unrelated code.
- Follow the existing code style and module structure.
- Never hardcode secrets, credentials, or environment-specific values in source files.
- Never replace MongoDB with in-memory data structures — implement the real database layer.
- Never claim a feature works unless it is actually implemented and verified.

## Status Transitions
All donation status changes must go through the backend. The frontend must never directly set arbitrary statuses. Enforce the allowed transitions in the route handlers.

## OTP Rules
- Store only the hash, never the raw OTP.
- Always enforce: expiry, attempt limits (max 5), single-use, and NGO ownership.
- Return the raw OTP only in the assignment response (for demo delivery — in production this would be SMS/email).

## After Changes
- Update `TASKS.md` to reflect actual progress.
- Update `architecture.md` only if a significant design decision changed.
- Run `npm run build` in `/client` to verify no compilation errors.
- Run the server and exercise the changed routes before marking a task done.

## What to Report
At the end of any session, report only:
- What was implemented
- Commands to run
- Environment variables still needed
- Verification steps performed
- Any incomplete items
