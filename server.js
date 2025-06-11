app.use(express.static('public'));

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the Infoman_partnership_app directory
app.use(express.static(path.join(__dirname)));

const users = {};

app.post('/api/signup', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (users[email]) {
        return res.status(400).json({ error: 'User already exists' });
    }

    users[email] = { password };
    return res.status(200).json({ message: 'User registered successfully' });
});

app.post('/api/login', (req, res) => {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
        return res.status(400).json({ error: 'Email, password, and userType are required' });
    }

    const user = users[email];
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.status(200).json({ message: `Logged in as ${userType}` });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
