# Taskly Backend API

Professional REST API for Taskly - Team Task Management Application.

## Tech Stack

- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
backend/
├── config/         # Database configuration
├── controllers/    # Route controllers
├── middleware/     # Auth & error handlers
├── models/         # Mongoose models
├── routes/         # API routes
├── utils/          # Utility functions & seed
├── .env.example    # Environment template
└── server.js       # Entry point
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Seed database (optional):**
   ```bash
   node utils/seed.js
   ```

4. **Start server:**
   ```bash
   npm run dev     # Development with nodemon
   npm start       # Production
   ```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/search?email=` | Search users by email |
| GET | `/api/users/:id` | Get user by ID |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all user's projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/:id` | Get single project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member by email |

### Tasks (Nested & Direct)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:projectId/tasks` | Get project tasks |
| POST | `/api/projects/:projectId/tasks` | Create task in project |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get stats, recent tasks & projects |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## Data Models

### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: Enum['admin', 'member'] (default: 'member')
}
```

### Project
```javascript
{
  name: String (required),
  description: String,
  color: String (hex color),
  createdBy: ObjectId (ref: User),
  members: [{
    user: ObjectId (ref: User),
    role: String,
    joinedAt: Date
  }]
}
```

### Task
```javascript
{
  project: ObjectId (ref: Project, required),
  title: String (required),
  description: String,
  status: Enum['todo', 'in-progress', 'done'] (default: 'todo'),
  priority: Enum['low', 'medium', 'high'] (default: 'low'),
  assignee: ObjectId (ref: User),
  dueDate: Date,
  createdBy: ObjectId (ref: User)
}
```

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Error Responses

```json
{
  "message": "Error description",
  "stack": "..." // Only in development
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | required |
| JWT_SECRET | JWT signing secret | required |
| NODE_ENV | Environment mode | development |
