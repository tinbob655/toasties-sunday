// Load environment variables FIRST
require('dotenv').config();

// Ensure database tables are created
const sequelize = require('./sequelize');
const SequelizeStore = require('connect-session-sequelize')(require('express-session').Store);
sequelize.sync();

const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

// Use Sequelize for session storage (works with MySQL on Railway)
const sessionStore = new SequelizeStore({
  db: sequelize,
});
sessionStore.sync();

const app = express();

const bodyParser = require('body-parser');

// Trust first proxy (needed for secure cookies behind reverse proxies)
app.set('trust proxy', 1);
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());

//will save login sessions
const sessionLengthDays = 7;
const isProduction = process.env.NODE_ENV === 'production';
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
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

const accountRouter = require('./routes/account');
app.use('/api/db/account', accountRouter);

const purchaseRouter = require('./routes/purchase');
app.use('/api/db/order', purchaseRouter);

const paymentRouter = require('./routes/payment');
app.use('/api/payment', paymentRouter);



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