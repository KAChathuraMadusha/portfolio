// db.js — MySQL Database Connection

const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit   : 10,
});

const db = pool.promise();

// Test connection
db.query('SELECT 1')
    .then(() => console.log('✅ MySQL connected successfully'))
    .catch(err => console.error('❌ MySQL connection error:', err.message));

module.exports = db;