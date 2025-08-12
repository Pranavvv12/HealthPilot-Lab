# HealthHub — Lab Glossary Search (MERN + JWT + Rate Limit + Caching)

A MERN app that lets users sign up/log in and search lab terms (LOINC) with a protected API. Includes JWT auth, weighted text search, Redis/in-memory caching, and rate limiting. Frontend runs on Vite (5173), backend on Node/Express (5000).

- Auth: JWT-based signup/login  
- Protected search: GET /search?query=... requires Bearer token  
- Search relevance: text index over COMPONENT, LONG_COMMON_NAME, RELATEDNAMES2  
- Caching: Redis (5 min TTL) with in-memory fallback  
- Rate limiting: 100 requests per 15 minutes per IP on auth/search endpoints  
- CORS: Configured for http://localhost:5173  

## Table of Contents  
- Tech Stack  
- Project Structure  
- Setup  
- Environment Variables  
- Running the App  
- API Reference  
- Database & Indexing  
- Caching (Redis)  
- Rate Limiting  
- Frontend Flow  
- Troubleshooting  
- Notes & Next Steps 

## Tech Stack  
- Frontend: React (Vite), Tailwind CSS, lucide-react  
- Backend: Node.js, Express, Mongoose  
- Auth: JWT (jsonwebtoken), bcryptjs  
- Middleware: cors, express-rate-limit  
- Cache: Redis (redis) with in-memory fallback  
- DB: MongoDB (Atlas or local)
  
## Project Structure  
\`\`\`
backend/
  server.js
  routes/
    auth.js
  models/
    User.js
    loinc.js
  middleware/
    authMiddleware.js
    rateLimiter.js
  utils/
    redisClient.js
    cache.js
  importExcelData.js
  .env

frontend/
  src/
    App.jsx
    index.css
    components/
      DashBoard.jsx
      Login.jsx
      Signup.jsx
  .env (optional for frontend)
\`\`\`

## Setup

1) Clone and install  
- Backend:  
  \`\`\`bash
  cd backend
  npm install
  \`\`\`  
- Frontend:  
  \`\`\`bash
  cd ../frontend
  npm install
  \`\`\`

2) MongoDB  
- Use a MongoDB Atlas connection string or a local Mongo URI.  
- Important: Atlas free tier has a 512 MB quota. Import only what you need or guard imports (see “Database & Indexing”).  

3) Redis (optional but recommended)  
- Docker on Windows:  
  \`\`\`bash
  docker run -d --name redis -p 6379:6379 redis:7-alpine
  \`\`\`  
- Or use a managed Redis (e.g., Upstash) and put its URL in REDIS_URL.  
- If you skip Redis, the app uses in-memory cache automatically.  

## Environment Variables (backend/.env)  
\`\`\`
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
# Optional caching
REDIS_URL=redis://127.0.0.1:6379
# Optional Atlas Search (if you created a search index)
# USE_ATLAS_SEARCH=true
\`\`\`

*Tip: Prefer 127.0.0.1 over localhost for REDIS_URL on Windows to avoid IPv6 (::1) issues.*

## Running the App

- Backend:  
  \`\`\`bash
  cd backend
  npm run dev        # if using nodemon
  # or
  node server.js
  \`\`\`  
  Expected logs:  
  - ✅ MongoDB connected  
  - ✅ Redis connected (if REDIS_URL set) OR message that in-memory cache is used  
  - 🚀 Server running on port 5000  

- Frontend (Vite):  
  \`\`\`bash
  cd frontend
  npm run dev
  \`\`\`  
  Open http://localhost:5173  

*CORS is already configured for 5173 on the backend.*

## API Reference

Base URL: http://localhost:5000

- **POST /auth/signup**  
  - Body: \`{ "username": "string", "password": "string" }\`  
  - Success: \`201 { "message": "User created successfully" }\`  
  - Errors:  
    - \`400 { "message": "User already exists" }\`  
    - \`400 { "message": "Invalid input" }\` (validation fails)  
    - \`500 { "message": "Server error. Please try again later." }\`  

- **POST /auth/login**  
  - Body: \`{ "username": "string", "password": "string" }\`  
  - Success: \`200 { "token": "JWT_TOKEN" }\`  
  - Errors:  
    - \`400 { "message": "Invalid credentials" }\`  
    - \`500 { "message": "Server error" }\`  

- **GET /search?query=your+term**  
  - Headers: \`Authorization: Bearer YOUR_JWT_TOKEN\`  
  - Success: \`200 [ { _id, LOINC_NUM, COMPONENT, LONG_COMMON_NAME, RELATEDNAMES2, ... } ]\`  
  - Errors:  
    - \`400 { "error": "Query parameter is required" }\`  
    - \`401 { "message": "Not authorized, token missing" }\` or \`"token invalid"\`  
    - \`429 { "message": "Too many requests, please try again later." }\`  
    - \`500 { "error": "Internal Server Error" }\`  

### Quick test:
\`\`\`bash
# Signup
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# Search (replace TOKEN)
curl "http://localhost:5000/search?query=glucose" \
  -H "Authorization: Bearer TOKEN"
\`\`\`

## Database & Indexing

- LOINC Model: Fields saved include COMPONENT, LONG_COMMON_NAME, RELATEDNAMES2 (array).  
- Text Index (for relevance):  
  - COMPONENT: 5  
  - LONG_COMMON_NAME: 3  
  - RELATEDNAMES2: 2  
- Importing LOINC (importExcelData.js):  
  - Parse RELATEDNAMES2 into an array (split on \`;\`, \`,\`, \`|\`).  
  - Guard imports to avoid refilling Atlas: import only if empty or controlled by env flag.  
- Atlas Search (optional):  
  - Create a Search Index on COMPONENT, LONG_COMMON_NAME, RELATEDNAMES2 fields.  
  - Enable fuzzy and synonyms as needed.  
  - Set \`USE_ATLAS_SEARCH=true\` in .env to use it.  

## Caching (Redis)

- TTL: 5 minutes (300s) for \`/search\` results.  
- Key format: \`search:<query>\`  
- Setup Redis via Docker or managed service.  
- In-memory fallback if Redis unavailable or URL unset.  
- Verify cache by repeating a search and checking logs or Redis keys.

## Rate Limiting

- Applies to \`/auth/*\` and \`/search\`.  
- Limit: 100 requests per IP per 15 minutes.  
- Exceeding limit returns:  
  - \`429 { "message": "Too many requests, please try again later." }\`

## Frontend Flow

- Landing page (\`DashBoard.jsx\`) shows Login and Sign Up buttons if logged out.  
- Auth modals open on click.  
- After login, JWT token stored in \`localStorage\`.  
- Authenticated requests to \`/search\` include \`Authorization\` header.  
- Search UI visible only when authenticated, shows backend results.  
- Logout clears token and resets UI.  

## Troubleshooting

- **401 Unauthorized** on \`/search\`: check \`Authorization\` header is present and correct.  
- **CORS errors**: backend CORS configured for \`http://localhost:5173\` with \`Authorization\` header allowed.  
- **Atlas quota exceeded**: drop large collections or disable auto-import.  
- **Redis connection refused**: start Redis Docker container or verify \`REDIS_URL\`. Use \`127.0.0.1\` on Windows.  
- **Duplicate signup** returns 400 error.  
- **Module imports errors**: confirm \`"type": "module"\` in backend \`package.json\`. Case-sensitive paths.

## Notes & Next Steps

- For production: use HTTP-only cookies or secure token storage.  
- Enable HTTPS and protect JWT secrets carefully.  
- Use Atlas Search for typo tolerance and better recall if needed.  
- Use shared Redis and higher-tier Atlas cluster in production.
