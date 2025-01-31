import dotenv from "dotenv";
// Load env variables first, before any other imports
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import roomRoutes from './routes/room_route.js';
import userRoutes from './routes/user_route.js';
import fileRoutes from './routes/file_route.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Middleware
app.use(express.json());

// Move CORS configuration here, before routes
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://codehiveng.vercel.app']
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// Connect to database
try {
  await connectDB();
  console.log('Database connected successfully');
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

// Environment variable checks
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not Set',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not Set',
  PUSHER_APP_ID: process.env.PUSHER_APP_ID ? 'Set' : 'Not Set',
  PUSHER_KEY: process.env.PUSHER_KEY ? 'Set' : 'Not Set',
  PUSHER_SECRET: process.env.PUSHER_SECRET ? 'Set' : 'Not Set',
  PUSHER_CLUSTER: process.env.PUSHER_CLUSTER ? 'Set' : 'Not Set'
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React frontend app
if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
    app.use(express.static(frontendBuildPath));

    // Handles any requests that don't match the ones above
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
}

export default app;
