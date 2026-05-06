import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// =====================
// Middleware
// =====================
app.use(cors({
  origin: '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Root / Production Static Files
// =====================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
} else {
  app.get('/', (req, res) => {
    res.status(200).json({
      message: '🚀 Taskie API is running',
      status: 'OK'
    });
  });
}

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
// Error Handler (MUST COME FIRST)
// =====================
app.use(errorHandler);

// =====================
// 404 Handler for API & Catch-all for React
// =====================
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }
  
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  } else {
    res.status(404).send('Route not found');
  }
});

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