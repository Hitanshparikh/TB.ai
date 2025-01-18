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
    const { googleId, email, name } = req.body;

    if (!googleId || !email || !name) {
        return res.status(400).json({ message: 'Google ID, email, and name are required' });
    }

    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email]);

        if (existingUser.length > 0) {
            return res.status(200).json({ message: 'Login successful', user: existingUser[0] });
        } else {
            const [result] = await db.query('INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)', [
                googleId,
                name,
                email,
            ]);

            const newUser = {
                id: result.insertId,
                google_id: googleId,
                name,
                email,
            };

            res.status(201).json({ message: 'User registered successfully', user: newUser });
        }
    } catch (error) {
        console.error('Error during Google login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}