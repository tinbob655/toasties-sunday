const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());


app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Website running on port ${PORT}`));

module.exports = app;