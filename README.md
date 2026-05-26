# PotSpot 🚧

A real-time community road hazard reporting map for South Africa. Report potholes, flooding, accidents, and road closures — instantly visible to everyone in your area.

**Live Demo:** [potspot-yrhi.vercel.app](https://potspot-yrhi.vercel.app) *(update with your URL)*

---

## Features

- **Real-time hazard map** — reports appear instantly for all connected users via WebSockets, no page refresh needed
- **One-tap reporting** — submit a hazard at your current location with category, severity, and optional description
- **Automatic address resolution** — coordinates are reverse geocoded to human-readable street names via OpenStreetMap
- **Category filtering** — filter map pins by pothole, flooding, accident, road closure, or other
- **My Reports dashboard** — view, resolve, and delete your own submissions
- **Report detail view** — upvote hazards reported by others to confirm severity
- **Auto-expiry** — reports automatically expire after 48 hours via MongoDB TTL indexes
- **Responsive design** — works on desktop and mobile with a bottom navigation bar

---

## Tech Stack

**Frontend**
- React 18 + Vite
- react-leaflet (interactive map)
- Socket.io-client (real-time updates)
- Axios
- shadcn/ui components

**Backend**
- Node.js + Express
- Socket.io (WebSocket server)
- Mongoose + MongoDB Atlas
- JWT authentication
- bcrypt password hashing

**Security**
- helmet (secure HTTP headers)
- express-rate-limit (100 req/15min general, 5 req/15min on auth routes)
- Manual NoSQL injection sanitisation
- CORS restricted to frontend URL
- IDOR protection on all report routes
- Input validation at controller level (enum guards, coordinate range checks, ObjectId validation)

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas (Cape Town region)

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/darrylchikamba/potspot.git
cd potspot
```

**Backend setup:**
```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

**Frontend setup:**
```bash
cd client
npm install
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Open `http://localhost:5173`

---

## API Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/reports` | Protected | Fetch all reports |
| GET | `/api/reports/:id` | Protected | Fetch single report |
| POST | `/api/reports` | Protected | Create report |
| PUT | `/api/reports/:id/upvote` | Protected | Toggle upvote |
| PUT | `/api/reports/:id/resolve` | Owner only | Mark as resolved |
| DELETE | `/api/reports/:id` | Owner only | Delete report |

---

## Real-time Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `new_report` | Report created | Full report object |
| `upvote_updated` | Upvote toggled | `{ reportId, upvotes }` |

---

## Project Structure

```
potspot/
├── client/                 # React frontend
│   └── src/
│       ├── api/            # Axios configuration
│       ├── components/     # Reusable components
│       ├── context/        # Auth context
│       └── pages/          # Route pages
└── server/                 # Express backend
    ├── config/             # Database connection
    ├── controllers/        # Route handlers
    ├── middleware/         # Auth, rate limiting
    ├── models/             # Mongoose schemas
    ├── routes/             # API routes
    └── utils/              # Reverse geocoding
```

---

## Screenshots

*Coming soon*

---

## Roadmap

- [ ] Push notifications for nearby hazards
- [ ] Municipality integration for official report tracking
- [ ] Heatmap view of problem areas
- [ ] Photo uploads for hazard evidence

---

## Licence

MIT
