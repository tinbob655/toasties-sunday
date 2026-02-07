//load environment variables FIRST
require('dotenv').config();

// Define environment flags early
const isProduction = process.env.NODE_ENV === 'production';

// Validate critical environment variables
const requiredEnvVars = ['SESSION_SECRET', 'STRIPE_SK'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`CRITICAL: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Application cannot start securely without these variables.');
  process.exit(1);
}

// Validate SESSION_SECRET strength
if (process.env.SESSION_SECRET.length < 32) {
  console.error('CRITICAL: SESSION_SECRET must be at least 32 characters long for security.');
  process.exit(1);
}

//ensure database tables are created
const sequelize = require('./sequelize');
const SequelizeStore = require('connect-session-sequelize')(require('express-session').Store);

//in production, use force: false to avoid schema changes. Use migrations for production schema updates.
sequelize.sync({ alter: !isProduction }).then(() => {
  console.log('Database synced successfully');
}).catch(err => {
  console.error('Database sync error:', err);
});

const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const { generalLimiter, paymentLimiter } = require('./middleware/rateLimit');

//use Sequelize for session storage (works with MySQL on Railway)
const sessionStore = new SequelizeStore({
  db: sequelize,
});
sessionStore.sync();

const app = express();

const bodyParser = require('body-parser');

//trust first proxy (needed for secure cookies behind reverse proxies)
app.set('trust proxy', 1);

// Configure CORS with specific allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1 && !isProduction) {
      // In development, allow all origins
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true
}));

// Stripe webhook needs raw body - must be BEFORE body parsers
const stripe = require('stripe')(process.env.STRIPE_SK);
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(200).json({ received: true });
  }
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const username = paymentIntent.metadata.username;
    
    if (username && username !== 'NO_NAME') {
      try {
        const { Sequelize, DataTypes, Model } = require('sequelize');
        const sequelize = require('./sequelize');
        
        // Use parameterized query with Sequelize's QueryTypes to prevent SQL injection
        const [results] = await sequelize.query(
          'UPDATE purchases SET paid = :paid WHERE username = :username AND paid = false',
          { 
            replacements: { paid: true, username: username },
            type: Sequelize.QueryTypes.UPDATE
          }
        );
        console.log(`Webhook: Order marked as paid for ${username}`);
      } catch (err) {
        console.error('Webhook: Error updating order:', err);
      }
    }
  }
  
  res.status(200).json({ received: true });
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());

//will save login sessions
const sessionLengthDays = 7;
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * sessionLengthDays,
  }
}));


//serve the frontend
app.use(express.static(path.join(__dirname, '../client/dist')));


// routes
//apply general rate limiting to all API routes
app.use('/api', generalLimiter);

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

const accountRouter = require('./routes/account');
app.use('/api/db/account', accountRouter);

const purchaseRouter = require('./routes/purchase');
app.use('/api/db/order', purchaseRouter);

const paymentRouter = require('./routes/payment');
app.use('/api/payment', paymentLimiter, paymentRouter);



//fallback will give a page
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Website running on port ${PORT}`));

module.exports = app;