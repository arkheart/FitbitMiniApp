const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Endpoint to provide the Fitbit Client ID
app.get('/config', (req, res) => {
  res.json({ clientId: process.env.FB_CLIENT_ID });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname)));

// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
