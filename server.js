const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/generate', async (req, res) => {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/YOUR_MODEL_NAME:generateContent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer AIzaSyCdrUb7yvO2XHAfM1IoQWFcOthyAqKZLyg`
        },
        body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
