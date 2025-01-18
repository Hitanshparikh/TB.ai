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
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        try {
            const [users] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

            if (users.length > 0) {
                res.status(200).json({
                    message: 'Login successful',
                    user: users[0],
                });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}