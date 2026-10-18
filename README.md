# FoodRescue AI

An AI-assisted food donation and NGO matching platform. Donors post surplus food, the matching engine ranks nearby NGOs by distance and food-safety feasibility, NGOs accept and assign volunteers, and pickup is verified with a time-limited OTP.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ running locally (or a MongoDB Atlas connection string)
- npm 9+

### 1. Clone and install
```bash
git clone <repo>
cd FoodRescueAI
npm run install:all
```

### 2. Configure environment variables

**server/.env**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodrescue
JWT_SECRET=replace_with_64_char_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start development
```bash
npm run dev
```
- Client: http://localhost:5173
- Server: http://localhost:5000
- Health: http://localhost:5000/health

## Project Structure
See `architecture.md` for the full folder structure, data models, and API reference.

## Roles
| Role  | Can do |
|-------|--------|
| DONOR | Create donations, browse NGO matches, track status, cancel |
| NGO   | Accept/reject requests, assign volunteers, verify pickup |

## Donation Lifecycle
```
REQUESTED → ACCEPTED → ASSIGNED → PICKUP_IN_PROGRESS → COMPLETED
                ↘ REJECTED
REQUESTED → CANCELLED (donor only, before ACCEPTED)
```

## OTP Verification (Demo Mode)
The raw OTP is returned in the assign response body for demo purposes. In production, deliver it via SMS or email. The backend stores only the bcrypt hash.

## Scripts
| Command              | Description                    |
|----------------------|--------------------------------|
| `npm run dev`        | Run client + server together   |
| `npm run install:all`| Install all dependencies       |
| `cd server && npm run dev` | Server only             |
| `cd client && npm run dev` | Client only             |
| `cd client && npm run build` | Production build      |

## Environment Files
- `server/.env.example` — copy to `server/.env`
- `client/.env.example` — copy to `client/.env`

## Known Limitations
- OTP delivered in API response (not SMS/email)
- Distance is straight-line (Haversine), not road distance
- Food safety eligibility is time-based only — human judgment required
- No real-time updates; refresh manually
- No pagination on list endpoints
