# PotSpot - Phase 1 Backend Implementation Walkthrough

This document outlines the Phase 1 implementation for the PotSpot backend. It serves as a reference for the directory structure, security configurations, MongoDB integration, and authentication workflows.

---

## 1. Directory Structure

The backend (`server/`) is organized logically into dedicated modules:

- **`config/`**: Contains core configuration scripts (e.g., `db.js` for MongoDB connection).
- **`controllers/`**: Contains the business logic for route endpoints (e.g., `authController.js`).
- **`middleware/`**: Contains application-level and route-level middlewares (e.g., error handlers, JWT verifiers, rate limiters).
- **`models/`**: Contains Mongoose schemas that map to the MongoDB database collections.
- **`routes/`**: Contains Express routers that define the endpoint paths and bind them to their respective controllers.
- **`index.js`**: The primary entry point that ties the application together, sets up global middleware, and initiates the server instance.

---

## 2. Environment Variables (.env)

The application strictly relies on environment variables. Hardcoded secrets are entirely avoided.

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://...
JWT_SECRET=your_super_secret_jwt_key
```

> [!WARNING]
> Never commit the `.env` file to version control.

---

## 3. Security Middleware & Configuration

The entry point (`index.js`) leverages several top-tier security standards to protect against malicious payloads and abuse.

### Global Defences
*   **Helmet (`helmet()`)**: Sets robust HTTP headers to defend against cross-site scripting (XSS), clickjacking, and mime-type sniffing.
*   **Mongo Sanitize (`express-mongo-sanitize()`)**: Strips out keys containing `$` or `.` from `req.body`, `req.params`, and `req.query`, preventing NoSQL injection attacks.
*   **Payload Size Limits**: Both `express.json()` and `express.urlencoded()` are strictly limited to `10kb` payloads, mitigating denial-of-service (DoS) attempts via bloated requests.
*   **Strict CORS (`cors`)**: Cross-Origin Resource Sharing is tied explicitly to the `FRONTEND_URL` environment variable via `corsOptions`. Wildcard `*` origins are avoided.

### Rate Limiters (`middleware/rateLimiters.js`)
*   **General Limiter**: Allows a maximum of **100 requests per 15 minutes** per IP address for all routes under `/api`.
*   **Auth Limiter**: An aggressive limiter allowing a maximum of **5 requests per 15 minutes** per IP address. This is applied explicitly to `/api/auth/` routes to prevent credential stuffing and brute-force attacks on the login systems.

---

## 4. User Model Schema (`models/User.js`)

The `User` schema is built with Mongoose and features built-in `.pre('save')` hooks for autonomous password hashing.

### Fields
*   **`username`** (String): Required.
*   **`email`** (String): Required, Unique.
*   **`password`** (String): Required.
*   **`timestamps`**: Automatically injects `createdAt` and `updatedAt`.

### Schema Methods
*   **Pre-Save Hook**: Intercepts the saving process. If the password has been modified, it asynchronously generates a salt (`10` rounds) and uses **Bcrypt** to hash the password before saving to the database.
*   **`matchPassword(enteredPassword)`**: An instance method utilizing Bcrypt's `compare` function to validate user login attempts against the stored hash.

---

## 5. Authentication Flow

Authentication relies on **JSON Web Tokens (JWT)** for stateless, HTTP-friendly token validation.

### Routes (`routes/authRoutes.js`)
All authentication routes sit behind the aggressive `authLimiter`.

*   **`POST /api/auth/register`**: 
    1. Validates presence of `username`, `email`, and `password`.
    2. Verifies the user doesn't already exist.
    3. Creates user in the database (password hashed automatically by Mongoose).
    4. Returns user metadata and a signed JWT.
    
*   **`POST /api/auth/login`**:
    1. Looks up user by `email`.
    2. Validates password via `user.matchPassword(password)`.
    3. Returns user metadata and a signed JWT upon success.

### JWT Protection Middleware (`middleware/auth.js`)
*   **`protect(req, res, next)`**: Intercepts secure routes, checking for an `Authorization: Bearer <token>` header. It validates the token using the `JWT_SECRET`. Upon success, it fetches the authorized User document (excluding the hashed password field) and attaches it to `req.user` before continuing to the protected controller logic.

---

## 6. Report Model & CRUD Operations (Phase 2 Additions)

Phase 2 established the core hazard reporting mechanisms utilizing geographic data types and TTL index implementations.

### Report Model Schema (`models/Report.js`)
The `Report` model contains detailed properties surrounding hazard logging:
*   **`location`** (GeoJSON Object): Format required as `{ type: "Point", coordinates: [lng, lat] }`. This field is attached to a `2dsphere` index to enable spatial querying (proximity lookups).
*   **`category`** (String Enum): Limited to `['pothole', 'flooding', 'accident', 'road_closure', 'other']`.
*   **`severity`** (String Enum): Defaulted to `'medium'`, constrained to `['low', 'medium', 'high']`.
*   **`description`** (String): Optional context limit to 300 characters.
*   **`address`** (String): Optional string holding reverse geocoding labels.
*   **`user`** (ObjectId): Strict connection to the `User` document representing ownership.
*   **`upvotes`** (Array of ObjectIds): Maintains state of `User`s who have validated the hazard (prevents double reporting).
*   **`status`** (String Enum): `['active', 'resolved']`, defaulting to active.
*   **`expiresAt`** (Date Object): Attached to a TTL index `{ expireAfterSeconds: 0 }` to strictly clear completed or stale reports.

### Protected API Routes (`routes/reportRoutes.js`)

All subsequent routes are strictly behind the `protect` JWT middleware and global 100/15min rate limits.

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports` | **Private** | Fetch all reports currently sharing an 'active' status. Populates `username` & `email` properties. |
| `GET` | `/api/reports/:id` | **Private** | Fetches an exact report globally without modifying properties. |
| `POST` | `/api/reports` | **Private** | Creates a new report referencing the logged-in user. Automatically sets `expiresAt` natively to exactly `48 hours` from insertion. |
| `PUT` | `/api/reports/:id/upvote` | **Private** | Multi-purpose endpoint verifying if user ID sits within `upvotes` array. Pushes to array if missing, pulls from array if existing. |
| `PUT` | `/api/reports/:id/resolve` | **Owner Only** | Verifies database document `user` equals the JSON token requestor ID. Flips the status to `'resolved'` if authenticated. |
| `DELETE` | `/api/reports/:id` | **Owner Only** | Similar identity strictness enforced as resolve routes. Completes database detachment via soft or hard delete implementation. |

---

## 7. Socket.io Real-Time Events (Phase 3 Additions)

Phase 3 introduces push-based real-time data flow. Currently bound exclusively to the backend `http.createServer()` instance under the identical `.env` PORT. 

### Instantiation
- `index.js` exports the `io` instance. This prevents duplicating web server ports during cross-file initialization.
- Socket's `cors` maps securely back to the same `FRONTEND_URL` environment parameter used by Express.
- Console emits `A client connected: <socket_id>` dynamically exactly when front-ends mount the event listener.

### Emitted Events
The backend forcefully emits these events to all globally connected clients when business logic updates happen directly in `reportController.js`:

| Event Trigger | Scenario Emitted | Payload Transmitted |
| :--- | :--- | :--- |
| `'new_report'` | Emitted when a user successfully hits the `POST /api/reports` endpoint, right after Mongoose commits `.save()`. | The full `Report` JSON object (including `_id`, `location`, `expiresAt`, etc.). |
| `'upvote_updated'` | Emitted when a user hits `PUT /api/reports/:id/upvote` and successfully modifies the `upvotes` array length. | An object containing `{ reportId, upvotes }` for performant client-side UI manipulation without deep refetching. |

---

## 8. Controller-Level Input Validation (Phase 4 Additions)

Phase 4 drastically hardened the endpoint validation at the controller level before requests are ever mapped to MongoDB schemas. All validations return a standard HTTP `400 Bad Request` or `404 Not Found` instantly avoiding 500 crashes.

### `authController.js`
*   **Login Pre-Checks**: An explicit array check validates `if (!email || !password)` before querying `User.findOne`. 

### `reportController.js`
*   **Native ENUM Guardrails**: `createReport` actively asserts incoming variables against native array arrays (`const allowedCategories = ['pothole', ...]`).
*   **String Length Checks**: `description` is parsed using `if (description.length > 300)`.
*   **Strict Geographic Math**: The `location.coordinates` pipeline was severely reinforced ensuring exactly two attributes exist, both map structurally to `'number'`, and mathematically sit within Longitude `[-180, 180]` and Latitude `[-90, 90]`. 
*   **ObjectId Interception**: Every endpoint utilizing a URL parameter strictly routes through `mongoose.Types.ObjectId.isValid()`. This eliminates unstructured characters from dumping into database fetches, which historically triggered application-breaking `CastError` exceptions.

---

## 9. Frontend Auth & Foundation (Phase 5 Additions)

Phase 5 successfully mapped the React/Vite layout securely onto the backend validations mimicking a high-fidelity utility.

### Frontend Configurations
*   **`Axios` Interceptors**: Injected deep into the `/api/axiosConfig.js` pipeline ensuring that `localStorage.getItem('token')` evaluates and securely embeds an `Authorization: Bearer <token>` property onto all outgoing headers dynamically to satisfy `walkthrough.md -> Section 5` constraints. 
*   **React Context Hydration**: `AuthContext.jsx` acts as the overarching global scope manager. It maps session states back out to memory utilizing robust `try/catch` checks, maintaining persistent user environments when reloading the DOM manually. 

### Protected Routing UI
React-Router DOM components restrict user flow based rigidly on internal Context verification.
*   **`ProtectedRoute` Component**: Auto-intercepts `<Route element={<ProtectedRoute>}>` declarations. Redirects unregistered users strictly back towards `/login`.
*   **Functional Views**: Both `/login` and `/register` components dynamically ingest the "Tactical Observer" UI rules implementing Space Grotesk, glassmorphism boundaries, and amber linear gradients explicitly.

---

## 10. Map View & Real-Time Data (Phase 6 Additions)

Phase 6 instantiated the core interactive hero interface utilizing Leaflet.

### Map Context (`client/src/pages/MapView.jsx`)
*   **Geolocating Coordinates**: Upon mounting, `navigator.geolocation` silently extracts accurate positioning arrays defaulting backward towards Benoni boundaries `[-26.1853, 28.3183]` internally.
*   **Real-Time Subscriptions**: Integrates `io.connect` specifically capturing `'new_report'` strings mapped recursively directly into the React array.
*   **Display Filters**: Floating pills mapping natively over `.leaflet-container`. Re-routes the displayed arrays instantly without server requests natively scaling performance globally.

### Spatial Rendering (`client/src/components/HazardPin.jsx`)
*   **HTML DOM Injection (`L.divIcon`)**: Leaflet fundamentally ignores raw map image layers natively injecting CSS containers mapped accurately onto standard X, Y parameters.
*   **Tactical Displays**: `<Popup>` overlays heavily styled internally relying on dynamic property injections to dictate warning borders (Amber for pothole, Red for accidents, Grey for minor closures).

### Transmission Layers (`client/src/components/ReportForm.jsx`)
*   **Coordinates Capture**: Maps location seamlessly straight off the parent `<MapView>` extracting precise `crosshairCentre` bindings minimizing manual string entry.
*   **Payload Protections**: Rejects transmission attempts where description strings exceed strictly mapped 300-count array structures natively routing directly back towards `POST /api/reports` internally.

### Structural Mounting (`client/src/components/ProtectedRoute.jsx`)
*   **Encapsulated Navigation**: The `Navbar.jsx` DOM mounts explicitly *inside* the authenticated wrapper ensuring public portals `/login`, `/register` natively ignore rendering dependencies mirroring standard login immersion aesthetics. 

---

## 11. Custom Reports & Detail Views (Phase 7 Additions)

Phase 7 finalised the report viewing logic through two primary structural routes, eliminating Tailwind classes completely in favour of brutalist inline style mappings.

### Personal Operations Log (`client/src/pages/MyReports.jsx`)
*   **Secure Client-Side Mapping**: Implements rigorous string validation (`report.user?.toString() === user?._id?.toString()`) to filter global `GET /api/reports` fetches down to only hazards owned by the active socket operator.
*   **Interactive List**: Maps custom cards showcasing dynamic status flags, time metrics, and exact coordinate/address hashes.
*   **Owner Toggles**: Injects actionable `PUT /api/reports/:id/resolve` and `DELETE /api/reports/:id` request buttons strictly for authenticated owners, providing a clean feedback loop for clearing the map organically.

### Single Node Detail (`client/src/pages/ReportDetail.jsx`)
*   **Comprehensive Data Rendering**: Intercepts the parameterized `:id` URL string via `useParams()` and mounts a clean metadata table mapping out exact operator usernames, upvote counts, and raw descriptions without clipping.
*   **Active Verification (Upvoting)**: Hooks into `PUT /api/reports/:id/upvote` displaying an active toggle. Internally maps `hasUpvoted` logic against the active operator `_id` array to conditionally fill the Amber SVG vector natively.

---

## 12. Reverse Geocoding Integration (Phase 8 Additions)

Phase 8 automated the extraction of human-readable street addresses directly from geographic coordinates without manual user input.

### OpenStreetMap Nominatim (`server/utils/geocode.js`)
*   **Native Fetch Mapping**: Employs the built-in Node 18+ `fetch` API querying `nominatim.openstreetmap.org` directly, avoiding heavy third-party packages.
*   **Address Trimming**: Intercepts the raw JSON `display_name` property and trims it strictly down to the first three comma-separated elements (e.g. "Hans Schoeman Street, Boksburg") to maintain UI minimalism.
*   **Fault Tolerance**: Wrapped securely in `try/catch` logic. If rate-limits or offline conditions trigger a failure, it silently returns `null` ensuring the overarching report submission process never crashes.

### Backend Injection (`server/controllers/reportController.js`)
*   **Automated Population**: Inside the `createReport` controller, the logic intercepts the `latitude` and `longitude` variables immediately after standard geographical boundary checks. 
*   **Address Mutation**: Replaces empty address arrays dynamically with the generated Nominatim strings right before locking the final schema block into MongoDB.
