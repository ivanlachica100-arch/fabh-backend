const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

dotenv.config();

const app = express();

// Body Parser & Cookie Parser
app.use(express.json());
app.use(cookieParser());

// NoSQL Injection Prevention (Safe for Express 5)
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});

// Security: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// CORS Config
// CORS Config - Supports Localhost, Vercel Production, and Previews
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://fabh-backend.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      // Allow exact matches in allowedOrigins OR any vercel.app preview domain
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app');

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS'));
    },
    credentials: true,
  })
);
// Route Handlers
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const boardingHouseRoutes = require('./routes/boardingHouses');
const reviewRoutes = require('./routes/reviews');

const path = require('path');

// Add this line with your other app.use() middlewares
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/boarding-houses', boardingHouseRoutes);
app.use('/api/boarding-houses/:boardingHouseId/reviews', reviewRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://127.0.0.1:${PORT}`));