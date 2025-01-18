import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        try {
            // Check if the email already exists
            const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (existingUser.length > 0) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Insert the new user into the database
            await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error('Error registering user:', error);

            // Check for specific MySQL errors
            if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                res.status(500).json({ message: 'Database access denied. Check credentials.' });
            } else if (error.code === 'ER_BAD_DB_ERROR') {
                res.status(500).json({ message: 'Database not found. Check DB name.' });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
