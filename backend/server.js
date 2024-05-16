const express = require('express');
const bodyParser = require("body-parser");
var cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const DB = require('./database.js'); 


require('dotenv').config();

const {
    getDepartments,
    getCourses,
    getCourse,
    insertReview,
    updateReactions,
    getAttributions
} = require('./functions');



const app = express();
app.use(bodyParser.json());


/*
const corsOptions = {
    origin: 'https://washucoursereviews.com'
};


const sslOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '/etc/letsencrypt/live/washucoursereviews.com/privkey.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, '/etc/letsencrypt/live/washucoursereviews.com/fullchain.pem'))
};


app.use(cors(corsOptions));
*/

app.use(cors());


const port = 3456;



app.get('/', async (req, res) => {

});


app.post('/getDepartments', async (req, res) => {
    try {
        const school = req.body.school;
        const departments = await getDepartments(school);
        res.json(departments);
    } catch (error) {
        console.error("Error fetching departments:", error);
        res.status(500).json({ error: "Failed to fetch departments" });
    }
});

app.post('/getCourses', async (req, res) => {
    try {
        const department = req.body.department;
        const courses = await getCourses(department);
        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

app.post('/getCourse', async (req, res) => {
    try {
        const name = req.body.name;
        const courses = await getCourse(name);
        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

app.post('/insertReview', async (req, res) => {
    try {
        const courseName = req.body.name
        const professor = req.body.professor;
        const quality = req.body.quality;
        const difficulty = req.body.difficulty;
        const hours = req.body.hours;
        const comment = req.body.comment;
        const date = req.body.date;

        const id = await insertReview(quality, difficulty, professor, hours, comment, date, courseName)
        res.json(id);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

app.post('/updateReaction', async (req, res) => {
    try {
        courseName = req.body.courseName;
        review_id = req.body.review_id;
        isLike = req.body.isLike;
        change = req.body.change;

        await updateReactions(courseName,review_id,isLike,change);
        res.json(true);
    } catch (error) {
        console.error("Error updating like:", error);
        res.status(500).json({ error: "Error updating like" });
    }
});


app.post('/getAttributions', async (req, res) => {
    try {
        const result = await getAttributions();
        res.json(result);
    } catch (error) {
        console.error("Error fetching attributions:", error);
        res.status(500).json({ error: "Failed to fetch attributions" });
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully.');
    await DB.close();
    console.log('Database connection closed.');
    process.exit(0); // Exit successfully
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
/*
https.createServer(sslOptions, app).listen(port, () => {
    console.log(`HTTPS server running on port ${port}`);
});*/
