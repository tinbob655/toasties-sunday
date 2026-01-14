const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

app.use(cors());


//routes



//frontend
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get(/^\/(?!.*\..*).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

//start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Website running on port ${PORT}`));