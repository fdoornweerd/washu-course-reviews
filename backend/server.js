const express = require('express');
const bodyParser = require("body-parser");
var cors = require('cors');
const {
    getSchools,
    getDepartments,
    getCourses,
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
    let departments = new Map();
    const SCHOOLS_ALLOWED = ['Architecture','Art','Arts & Sciences','Business','Engineering','Interdisciplinary Programs'];
    for(const school in SCHOOLS_ALLOWED){
        const department = await getDepartments(school);
        departments.set(school,departments);
    }
    
    res.json({departments: departments});
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
