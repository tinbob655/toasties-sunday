const express = require('express');
const router = express.Router();

const {Pool} = require('pg');
const pool = new Pool({connectionString: process.env.MYSQL_URL});


module.exports = router;