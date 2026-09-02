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
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Routes
const authRoutes = require('./routes/auth');
const boardingHouseRoutes = require('./routes/boardingHouses');

app.use('/api/auth', authRoutes);
app.use('/api/boarding-houses', boardingHouseRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));