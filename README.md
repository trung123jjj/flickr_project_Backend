# Flickr Project — Backend

Backend API for **Flickr** — a real-time social movie discovery, rating, and commenting app.

- **Frontend:** [Flutter app](https://github.com/anomalyco/flickr_project)
- **Base URL (Production):** `https://flickr-project-backend-6.onrender.com`
- **API Docs (Swagger):** `https://flickr-project-backend-6.onrender.com/api-docs`

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** (>=18) | Runtime |
| **Express 5** | Web framework |
| **MongoDB** (Mongoose 9) | Database |
| **Socket.IO** | Real-time comments |
| **JWT** (jsonwebtoken) | Authentication (access + refresh token) |
| **bcryptjs** | Password hashing |
| **Multer** | File upload (avatars, comment images) |
| **Helmet** | Security HTTP headers |
| **express-rate-limit** | Request rate limiting |
| **express-validator** | Input validation |
| **cookie-parser** | Cookie handling (refresh token) |
| **dotenv** | Environment variables |

---

## Project Structure

```
flickr_project_Backend/
├── src/
│   ├── controllers/        # Business logic
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── notificationController.js
│   │   ├── ratingController.js
│   │   ├── refreshTokenController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── libs/
│   │   └── db.js           # MongoDB connection
│   ├── middleware/
│   │   ├── errorHandler.js  # Centralized error handling
│   │   ├── logEvents.js     # Logging
│   │   ├── optionalJWT.js   # Optional JWT middleware
│   │   ├── upload.js        # File upload (Multer)
│   │   ├── validate.js      # Request validation
│   │   └── verifyJWT.js     # JWT verification
│   ├── models/
│   │   ├── User.model.js    # User accounts
│   │   ├── Session.model.js # Refresh token sessions
│   │   ├── Comment.model.js # Comments & replies
│   │   ├── Rating.model.js  # Star ratings (0–5)
│   │   ├── Notification.model.js # Notifications
│   │   └── Report.model.js  # Abuse reports
│   ├── routes/
│   │   ├── auth.js          # POST /api/auth/signup, /signin, /signout, /refresh
│   │   ├── comment.js       # Comment CRUD + likes + image upload
│   │   ├── notification.js  # Notifications CRUD + unread count
│   │   ├── rating.js        # Movie ratings
│   │   ├── refresh.js       # Token refresh
│   │   ├── report.js        # Abuse reports (admin)
│   │   └── user.js          # Profile, avatar, password
│   ├── scripts/             # Utility scripts (empty)
│   └── server.js            # Entry point
├── uploads/
│   ├── avatars/             # User avatar images
│   └── comments/            # Comment images
├── logs/                    # Application logs
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment variable template
├── package.json
└── render.yaml              # Render deployment config

```

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register a new user |
| POST | `/signin` | Log in |
| POST | `/signout` | Log out |
| POST | `/refresh` | Refresh access token |

### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get user profile |
| PUT | `/avatar` | Update avatar (multipart) |
| PUT | `/change-username` | Change username |
| PUT | `/change-password` | Change password |
| DELETE | `/:username` | Delete user + all data (admin) |

### Comments (`/api/comments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all comments |
| GET | `/:movieId` | Get comments for a movie |
| POST | `/` | Create a comment |
| POST | `/upload-image` | Upload a comment image |
| DELETE | `/:id` | Soft-delete a comment (owner) |
| POST | `/:id/like` | Toggle like on a comment |

### Ratings (`/api/ratings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/movie/:movieId` | Get rating for a movie |
| POST | `/batch` | Batch get ratings |
| POST | `/` | Submit a rating |

### Reports (`/api/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all reports (admin) |
| POST | `/` | Create a report |
| DELETE | `/:reportId` | Delete a report |
| POST | `/notice` | Send notice to user (admin) |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List notifications |
| GET | `/unread-count` | Unread notification count |
| PATCH | `/read-all` | Mark all as read |
| PATCH | `/:id/read` | Mark one as read |
| DELETE | `/:id` | Delete a notification |

### TMDB Proxy (`/api/tmdb`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| ANY | `/*` | Proxy requests to TMDB API v3 |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |

---

## Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas (or local MongoDB instance)

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd flickr_project_Backend

# 2. Install dependencies
npm install

# 3. Create .env from template
cp .env.example .env
# Edit .env with your configuration

# 4. Run in development mode (with nodemon)
npm run dev

# Or run in production mode
npm start
```

### Environment Variables (.env)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Server port (default: 8080) |
| `ACCESS_TOKEN_SECRET` | Secret for signing access tokens |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh tokens |
| `CORS_ORIGIN` | Allowed CORS origin(s) |

---

## Authentication

- **Access Token:** JWT, expires in 5 minutes, sent via `Authorization: Bearer <token>` header
- **Refresh Token:** 64-byte random string, stored in an **HttpOnly cookie** + database (`Session` collection), expires in 7 days
- When the access token expires, the client calls `POST /api/auth/refresh` to obtain a new one

---

## Real-time (Socket.IO)

Clients connect to the same base URL via Socket.IO. Events:

| Event | Direction | Description |
|-------|-----------|-------------|
| `joinMovie` | client → server | Join a movie room |
| `leaveMovie` | client → server | Leave a movie room |
| `newComment` | server → client | New comment posted |
| `commentUpdated` | server → client | Comment updated |
| `commentDeleted` | server → client | Comment deleted |

---

## Deployment

Pre-configured for **Render** via `render.yaml`:

```yaml
services:
  - type: web
    name: flickr-backend
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: node server.js
```

---

## Notes

- Built on **Express 5** — verify package compatibility when adding dependencies
- Uploaded files are stored in `uploads/` (already in `.gitignore`)
- Error logs are written to `logs/errorLog.txt`
- This project is under active development. See [ISSUES.md](./ISSUES.md) for known issues and improvements.
