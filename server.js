const express = require('express');
const { getClasses } = require('./scrape');

const app = express();
const port = 3456;

const scrape = async (req, res) => {
    const output = await getClasses();
    res.send(output);
};


app.get('/', async (req, res) => {
    await scrape(req, res);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
