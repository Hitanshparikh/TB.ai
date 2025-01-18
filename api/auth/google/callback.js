import { OAuth2Client } from 'google-auth-library';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
});

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.VERCEL_URL || 'http://localhost:3000'}/auth/google/callback`
);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const code = req.query.code;

        if (!code) {
            return res.status(400).json({ message: 'Missing authorization code' });
        }

        try {
            const { tokens } = await client.getToken(code);
            const ticket = await client.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();

            const googleId = payload.sub;
            const email = payload.email;
            const name = payload.name;

            // Check if the user exists
            const [existingUser] = await db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email]);

            if (existingUser.length > 0) {
                // Existing user
                res.redirect('/dashboard.html');
            } else {
                // New user, insert into database
                await db.query('INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)', [googleId, name, email]);
                res.redirect('/dashboard.html');
            }
        } catch (error) {
            console.error('Error during Google OAuth:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}