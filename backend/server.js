const express = require('express');
const bodyParser = require("body-parser");
var cors = require('cors');
const {
    getSchools,
    getDepartments,
    getCourses,
    getCourse,
    searchCourses,
    getProfessorLink,
    insertReview,
    fetchReviews,
    summarizeReviews
} = require('./functions');





const app = express();
app.use(cors());
app.use(bodyParser.json());



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
        const school = req.body.school;
        const department = req.body.department;
        const courses = await getCourses(school,department);
        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

app.post('/getCourse', async (req, res) => {
    try {
        const school = req.body.school;
        const department = req.body.department;
        const name = req.body.name;
        const courses = await getCourse(school,department, name);
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

        await insertReview(quality, difficulty, professor, hours, comment, date, courseName)
        res.json(true);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
