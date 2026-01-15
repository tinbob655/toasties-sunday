const express = require('express');
const app = express();

// Your routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

module.exports = app;