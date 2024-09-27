require('dotenv').config();
const { getRanking } = require('./controllers.js');
const express = require('express');
const app = express();

let mainBuffer = null;
let backBuffer = null;

// Scraping data initially 
const updateBuffers = async () => {
    console.log('Scraping data...');
    backBuffer = await getRanking(); // getting data
    if (backBuffer) {
        console.log('Data scraped successfully:', backBuffer);
        // Swapping buffers after scraping is complete
        mainBuffer = backBuffer;
        backBuffer = null;
        console.log('Buffers swapped. Main buffer updated.');
    } else {
        console.log('Failed to scrape data.');
    }
};

// Update data every 30 seconds
setInterval(updateBuffers, 30000);

// Initial data scrape 
updateBuffers();

app.get('/api/ranking', (req, res) => {
    if (mainBuffer) {
        res.status(200).json(mainBuffer);
    } else {
        console.log('Data not yet available for /api/ranking');
        res.status(503).json({ message: 'Data is not yet available.' });
    }
});

app.get('/', (req, res) => {
    res.send('Scoreboard');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
