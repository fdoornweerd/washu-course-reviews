const express = require('express');

const app = express();
const port = 3456;



app.get('/', async (req, res) => {
    res.send("Hello World!")
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});