const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config();

// MySQL connection configuration
const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

// Connect to MySQL
connection.connect((err) => {
	if (err) {
		console.error('Error connecting to MySQL:', err);
		return;
	}
	console.log('Connected to MySQL database');
});

module.exports = connection;
