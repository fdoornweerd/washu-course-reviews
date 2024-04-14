const express = require('express');
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
const port = 3456;



app.get('/', async (req, res) => {
    const schools = await getSchools();
    res.json(schools);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
