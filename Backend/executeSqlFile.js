const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
	'DB_HOST',
	'DB_PORT',
	'DB_USER',
	'DB_PASSWORD',
	'DB_NAME',
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
	console.error(
		'Missing required environment variables:',
		missingVars.join(', ')
	);
	process.exit(1);
}

const sqlFilePath = process.argv[2] || path.join(__dirname, 'codes.sql');

async function main() {
	let pool;
	try {
		// Read SQL file
		const rawSQL = await fs.readFile(sqlFilePath, 'utf8');
		const sql = rawSQL.replace(/\r\n/g, '\n').trim();

		// Create MySQL connection pool
		pool = mysql.createPool({
			host: process.env.DB_HOST,
			port: Number(process.env.DB_PORT),
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			waitForConnections: true,
			connectionLimit: 5,
			queueLimit: 0,
			multipleStatements: true,
		});

		const connection = await pool.getConnection();
		console.log('Connected to MySQL server.');

		// Create the database if it doesn't exist
		await connection.query(
			`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
		);
		console.log('Database checked/created.');

		// Switch to the database
		await connection.changeUser({ database: process.env.DB_NAME });
		console.log(`Switched to database: ${process.env.DB_NAME}`);

		// Execute the full SQL script
		await connection.query(sql);
		console.log('SQL file executed successfully.');

		connection.release();
	} catch (err) {
		console.error('Error:', err.message);
		process.exit(1);
	} finally {
		if (pool) await pool.end();
		console.log('Connection pool closed.');
	}
}

// Handle uncaught/unhandled exceptions
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
	process.exit(1);
});

process.on('unhandledRejection', (err) => {
	console.error('Unhandled Rejection:', err);
	process.exit(1);
});

main();
