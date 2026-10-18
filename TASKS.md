# FoodRescue AI — Task Tracker

Status: TODO | IN PROGRESS | DONE

---

## Phase 1 — Documentation & Scaffold
- [x] architecture.md
- [x] AGENTS.md
- [x] TASKS.md
- [x] README.md
- [x] Root package.json (concurrently)
- [x] .gitignore
- [x] server/package.json + folder structure
- [x] client/package.json + Vite + Tailwind

## Phase 2 — Backend Core
- [x] MongoDB connection (config/db.js)
- [x] User model (DONOR + NGO roles, coordinates)
- [x] Auth routes (register, login, me)
- [x] JWT middleware (protect, authorise)
- [x] Input validation middleware
- [x] Centralized error handler

## Phase 3 — Donation System
- [x] Donation model (status enum, full lifecycle)
- [x] PickupAssignment model (OTP hash, expiry, attempts)
- [x] Notification model
- [x] POST /api/donations
- [x] GET /api/donations/my
- [x] GET /api/donations/available
- [x] GET /api/donations/:id
- [x] PATCH /api/donations/:id/accept
- [x] PATCH /api/donations/:id/reject
- [x] PATCH /api/donations/:id/cancel
- [x] POST /api/donations/:id/assign (volunteer + OTP)
- [x] POST /api/donations/:id/verify-pickup (OTP check)

## Phase 4 — NGO Matching Engine
- [x] Haversine distance calculation
- [x] Pickup time estimation
- [x] Safety buffer + eligibility check
- [x] Capacity filter
- [x] Scoring and ranking
- [x] GET /api/ngos/nearby

## Phase 5 — Notifications
- [x] Notification creation on all status changes
- [x] GET /api/notifications
- [x] PATCH /api/notifications/:id/read

## Phase 6 — Frontend
- [x] Axios instance + API helpers
- [x] AuthContext + protected routes
- [x] Design system (Tailwind config, shared components)
- [x] Landing page
- [x] Login + Register pages
- [x] Donor Dashboard
- [x] Create Donation form
- [x] NGO Matching Results
- [x] Donation Detail + tracking timeline
- [x] NGO Dashboard
- [x] Request Detail (Accept/Reject)
- [x] Assign Volunteer form
- [x] Pickup Verification (OTP entry)
- [x] Notifications page

## Phase 7 — Verification
- [x] Server builds without errors
- [x] Client builds without errors
- [x] Auth flow tested (register → login → me)
- [x] Donor flow tested (create → match → submit)
- [x] NGO flow tested (accept → assign → verify)

## Pending / Known Gaps
- [ ] Email/SMS OTP delivery (currently returned in API response)
- [ ] Pagination on list endpoints
- [ ] Food photo upload
- [ ] Real-time notifications (WebSocket)
- [ ] Admin panel
