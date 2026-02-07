//load environment variables FIRST
require('dotenv').config();

//ensure database tables are created
const sequelize = require('./sequelize');
const SequelizeStore = require('connect-session-sequelize')(require('express-session').Store);
const isProduction = process.env.NODE_ENV === 'production';

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
app.use(cors({
  origin: true,
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
        
        // Get the Purchase model (defined in purchase.js)
        const [results] = await sequelize.query(
          'UPDATE purchases SET paid = true WHERE username = ? AND paid = false',
          { replacements: [username] }
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