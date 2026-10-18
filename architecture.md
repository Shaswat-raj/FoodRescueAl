# FoodRescue AI — Architecture

## Purpose & MVP Scope
FoodRescue AI is a platform that connects food donors with nearby NGOs for efficient food rescue. The MVP covers:
- Donor and NGO registration/authentication
- Donation creation with food metadata
- Local JS matching engine that ranks nearby NGOs by distance, capacity, and food-safety feasibility
- Full donation lifecycle: REQUESTED → ACCEPTED → ASSIGNED → PICKUP_IN_PROGRESS → COMPLETED (+ REJECTED, CANCELLED)
- OTP-based pickup verification (hashed, short-lived, single-use)
- In-app notifications for all status changes

## Technology Stack
| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 18 + Vite, Tailwind CSS, React Router v6, Axios, Lucide React |
| Backend     | Node.js 18+, Express 4                  |
| Database    | MongoDB 6+ via Mongoose 8               |
| Auth        | JWT (access token), bcryptjs            |
| Validation  | express-validator                       |
| Dev tooling | nodemon, concurrently                   |

## Folder Structure
```
FoodRescueAI/
├── architecture.md
├── AGENTS.md
├── TASKS.md
├── README.md
├── .gitignore
├── .env.example
├── package.json              # root — concurrently dev script
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/              # axios instance + per-resource helpers
│       ├── context/          # AuthContext
│       ├── hooks/            # useAuth, useToast
│       ├── components/       # shared UI primitives
│       └── pages/
│           ├── Landing.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── donor/
│           │   ├── DonorDashboard.jsx
│           │   ├── CreateDonation.jsx
│           │   ├── MatchResults.jsx
│           │   └── DonationDetail.jsx
│           └── ngo/
│               ├── NgoDashboard.jsx
│               ├── RequestDetail.jsx
│               ├── AssignVolunteer.jsx
│               └── PickupVerify.jsx
│           └── Notifications.jsx
│
└── server/
    ├── .env.example
    ├── package.json
    └── src/
        ├── index.js
        ├── app.js
        ├── config/
        │   └── db.js
        ├── models/
        │   ├── User.js
        │   ├── Donation.js
        │   ├── PickupAssignment.js
        │   └── Notification.js
        ├── middleware/
        │   ├── auth.js
        │   ├── validate.js
        │   ├── errorHandler.js
        │   └── notFound.js
        ├── services/
        │   └── matchingEngine.js
        ├── utils/
        │   └── otp.js
        └── routes/
            ├── auth.routes.js
            ├── ngo.routes.js
            ├── donation.routes.js
            └── notification.routes.js
```

## Database Models

### User
- name, email (unique), passwordHash, role (DONOR|NGO), phone, address
- coordinates: { lat, lng }
- organization (NGO only), pickupCapacity (NGO only)
- isActive, timestamps

### Donation
- donor: ref User
- assignedNgo: ref User (nullable)
- foodName, category (enum), quantity, unit, preparedAt, safeUseBy, storageConditions, pickupAddress
- pickupCoordinates: { lat, lng }
- status: REQUESTED | ACCEPTED | ASSIGNED | PICKUP_IN_PROGRESS | COMPLETED | REJECTED | CANCELLED
- notes, timestamps

### PickupAssignment
- donation: ref Donation (unique)
- ngo: ref User
- volunteer: { name, idRef, phone }
- otpHash, otpExpiry, otpAttempts (max 5), otpUsed
- assignedAt, completedAt, timestamps

### Notification
- recipient: ref User
- donation: ref Donation (nullable)
- type: enum (REQUEST_RECEIVED | ACCEPTED | REJECTED | ASSIGNED | PICKUP_STARTED | COMPLETED | CANCELLED)
- message, read (bool), timestamps

## Authentication & Permissions
- JWT in Authorization: Bearer header
- `protect` middleware validates token on all non-public routes
- `authorise(role)` enforces role-based access
- NGOs can only act on donations assigned to them
- Donors can only act on their own donations
- Passwords hashed with bcryptjs (12 rounds)

## API Routes

### Auth
| Method | Path               | Body                              | Auth    |
|--------|--------------------|-----------------------------------|---------|
| POST   | /api/auth/register | name,email,password,role,phone,address,coordinates,[org,capacity] | No |
| POST   | /api/auth/login    | email,password                    | No      |
| GET    | /api/auth/me       | —                                 | Yes     |

### NGOs
| Method | Path              | Description           | Auth |
|--------|-------------------|-----------------------|------|
| GET    | /api/ngos/nearby  | ?lat&lng&deadline&category | Yes (DONOR) |

### Donations
| Method | Path                              | Auth           |
|--------|-----------------------------------|----------------|
| POST   | /api/donations                    | DONOR          |
| GET    | /api/donations/my                 | Any            |
| GET    | /api/donations/available          | NGO            |
| GET    | /api/donations/:id                | Owner or NGO   |
| PATCH  | /api/donations/:id/accept         | NGO            |
| PATCH  | /api/donations/:id/reject         | NGO            |
| POST   | /api/donations/:id/assign         | NGO            |
| POST   | /api/donations/:id/verify-pickup  | NGO            |
| PATCH  | /api/donations/:id/cancel         | DONOR          |

### Notifications
| Method | Path                          | Auth |
|--------|-------------------------------|------|
| GET    | /api/notifications            | Any  |
| PATCH  | /api/notifications/:id/read   | Any  |

## Donation Status Transitions
```
REQUESTED ──► ACCEPTED ──► ASSIGNED ──► PICKUP_IN_PROGRESS ──► COMPLETED
     │              │
     └──► CANCELLED  └──► REJECTED
```
- REQUESTED: donor submitted, awaiting NGO
- ACCEPTED: NGO accepted, pending volunteer assignment
- ASSIGNED: volunteer assigned, OTP generated
- PICKUP_IN_PROGRESS: NGO called verify-pickup with correct OTP
- COMPLETED: server marks complete after OTP verification
- REJECTED: NGO declined
- CANCELLED: donor cancelled before ACCEPTED

## NGO Matching Algorithm (matchingEngine.js)
Inputs: donorCoords, safeUseBy (Date), category, all active NGOs with coords+capacity

Steps:
1. Haversine distance (km) for each NGO
2. Estimated pickup time = distance / ASSUMED_SPEED_KPH (20 km/h default)
3. Available window = safeUseBy - now
4. Eligibility: estimatedPickupMinutes + SAFETY_BUFFER_MINUTES (30) < availableMinutes
5. Capacity filter: NGO pickupCapacity > 0 (if set)
6. Score = (1/distance)*0.6 + (capacityScore)*0.4
7. Return ranked list with distance, estimatedPickupMins, score, eligibilityReason

Assumptions documented in service file. No live traffic. No scientific spoilage claims.

## OTP Verification
- 6-digit numeric OTP generated at assignment
- Stored as bcrypt hash (10 rounds) in PickupAssignment
- Expires 4 hours after assignment
- Max 5 attempts tracked
- Single-use: otpUsed flag
- Only the assigned NGO may call verify-pickup
- On success: donation → COMPLETED, completedAt recorded, donor+NGO notified

## Environment Variables
### server/.env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodrescue
JWT_SECRET=<random 64-char string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
### client/.env
```
VITE_API_URL=http://localhost:5000/api
```

## Commands
```bash
# Install all
npm run install:all

# Dev (both)
npm run dev

# Server only
cd server && npm run dev

# Client only
cd client && npm run dev

# Build client
cd client && npm run build
```

## Known Limitations & Pending Work
- No email notifications (in-app only)
- No file upload for food photos
- No real-time updates (polling or manual refresh needed)
- Matching uses straight-line distance, not road distance
- Food safety eligibility is time-based only — human review required for actual decisions
- No admin panel
- No pagination on list endpoints (MVP scope)
- OTP delivered in API response for demo purposes (production: SMS/email delivery)
