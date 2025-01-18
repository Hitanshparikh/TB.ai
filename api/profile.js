export default function handler(req, res) {
    // Example: Protect this route with a token check or a session validation.
    res.status(200).json({ message: 'Profile details', user: { id: 1, name: 'John Doe' } });
}