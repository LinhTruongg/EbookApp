// server.js - Main Backend Server
require('dotenv').config();

// Set default environment variables if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'f4f22d75053e18c1465114a57d7ca5b949e772207a6f3f209e093536189a24aff705f8334ef6df86aca28b501865b655df59dc47831fccf699cec7c427a52a69';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = '588b5af0a80269423f7334896217b0d6089351af5299442902bfaea6fbfbd28223f03800a571ac3cb24d601402fe00b43ef185ea4a6b0c830a78707a01e2f699';
}
if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = '7d';
}
if (!process.env.JWT_REFRESH_EXPIRES_IN) {
  process.env.JWT_REFRESH_EXPIRES_IN = '30d';
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import models and database
const db = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const authorRoutes = require('./routes/authors');
const reviewRoutes = require('./routes/reviews');
const commentRoutes = require('./routes/comments');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const stripeRoutes = require('./routes/stripe');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for development
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(compression());

// CORS configuration - Enhanced for React Native development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3001', // Admin web
      'http://localhost:3000', // Same port access
      'http://localhost:8080', // Common dev port
      'http://localhost:8081', // Expo Metro bundler
      'http://localhost:8082', // Alternative Metro port
      'exp://localhost:19000', // Expo development
      'http://localhost:19006', // Expo web
      'http://127.0.0.1:3000',  // IP access
      'http://192.168.2.25:3000', // Machine IP access
      'http://192.168.2.25:8081', // React Native Metro on machine IP
      'http://192.168.2.25:19006', // Expo web on machine IP
    ];
    
    // Allow all localhost origins for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    console.log('🚫 CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.API_RATE_LIMIT || 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));
// Serve public files at root for easy access
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/stripe', stripeRoutes);

// API Documentation
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-book Store API',
      version: '1.0.0',
      description: 'API for E-book Store Application',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'E-book Store API Server',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Database connection and server start
async function startServer() {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync database (only in development) - temporarily disabled due to schema issues
    // if (process.env.NODE_ENV === 'development') {
    //   await db.sequelize.sync({ alter: false });
    //   console.log('✅ Database synchronized');
    // }

    // Start server on all interfaces for React Native development
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 E-book Store API Server running!
📍 Local URL: http://localhost:${PORT}
📱 Network URL: http://192.168.2.25:${PORT}
📚 API Docs: http://localhost:${PORT}/api-docs
🔍 Health Check: http://localhost:${PORT}/health
🌍 Environment: ${process.env.NODE_ENV || 'development'}
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  await db.sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  await db.sequelize.close();
  process.exit(0);
});

startServer();
