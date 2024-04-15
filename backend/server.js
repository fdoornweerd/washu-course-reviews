const express = require('express');
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
app.use(cors())
const port = 3456;



app.get('/', async (req, res) => {
    const schools = await getSchools();
    res.json(schools);
});


app.post('/getAllCourses', async (req, res) => {
    const schools = await getSchools();
    const dept = req.body.dept;
    res.json(schools);
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
