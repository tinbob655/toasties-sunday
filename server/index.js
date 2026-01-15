const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
require('dotenv').config();


app.use(cors());


//serve the frontend
app.use(express.static(path.join(__dirname, '../client/dist')));

//routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

const db = require('./routes/db');
app.use('/api/db', db);

//fallback will give a page
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Website running on port ${PORT}`));

module.exports = app;