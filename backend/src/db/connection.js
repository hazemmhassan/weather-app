const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'weather_app',
  dateStrings:      true,   // return DATE columns as 'YYYY-MM-DD' strings
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
});

// Verify the connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Check your .env file and make sure the database exists.');
  });

module.exports = pool;
