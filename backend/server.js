import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Config & DB
import connectDB from './config/db.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load env variables
dotenv.config();

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// =====================
// Middleware
// =====================
app.use(cors()); // same-origin → no need for strict CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Health Check
// =====================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// =====================
// API Routes
// =====================
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// =====================
// 404 Handler (API only)
// =====================
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }
  next();
});

// =====================
// SERVE FRONTEND (Vite build)
// =====================
const __dirname = path.resolve();

// serve static files
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback (CRITICAL)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// =====================
// Error Handler (LAST)
// =====================
app.use(errorHandler);

// =====================
// Server Start
// =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// =====================
// Handle Uncaught Errors
// =====================
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});