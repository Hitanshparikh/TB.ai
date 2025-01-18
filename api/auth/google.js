import { OAuth2Client } from 'google-auth-library';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configure your MySQL connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
});

// Google OAuth2 client
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.VERCEL_URL || 'https://tb.ai.hivizstudios.com/'}/auth/google/callback`
);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Redirect to Google's OAuth 2.0 server
        const authUrl = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email'],
        });
        res.redirect(authUrl);
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}