const db = require('./database.js'); 
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();



async function getDepartments(school){
    const database = await db.connect(process.env.MONGODB_URI);
    const depts = database.collection('departments');

    try {
        return await depts.distinct("department", {school: school});
    } catch (err) {
        console.error('Error fetching departments:', err);
        return [];
    }
}


async function getCourses(department){
    const database = await db.connect(process.env.MONGODB_URI);
    const courses = database.collection('courses');

    try {
        if (department == 'all') {
            return await courses.find().sort({ numScores: -1 }).toArray();
        } else {
            return await courses.find({department: department}).sort({ numScores: -1 }).toArray();
        }
    } catch (err) {
        console.error('Error fetching courses:', err);
        return [];
    }
}


async function getCourse(name){
    const database = await db.connect(process.env.MONGODB_URI);
    const courses = database.collection('courses');

    try {
        return await courses.findOne({name: name});
    } catch (err) {
        console.error('Error fetching course:', err);
        return null;
    }
}


async function insertReview(quality, difficulty, instructor, hours, comment, datePosted, courseName){
    const database = await db.connect(process.env.MONGODB_URI);
    const courses = database.collection('courses');

    const JSON_review = {
        "id": uuidv4(),
        "quality": quality,
        "difficulty": difficulty,
        "instructor": instructor,
        "hours": hours,
        "comment": comment,
        "date": datePosted,
        'upVotes': 0,
        'downVotes': 0
    };

    const reviewedCourse = await courses.findOne({name: courseName});

    const result = await courses.updateOne(
        { name: courseName },
        { 
            $push: { 
                reviews: {
                    $each: [JSON_review],
                    $position: 0
                }
            },
            $set: {
                numScores: reviewedCourse.numScores + 1,
                avgQuality: ((reviewedCourse.numScores * reviewedCourse.avgQuality) + parseInt(quality)) / (reviewedCourse.numScores + 1),
                avgDifficulty: ((reviewedCourse.numScores * reviewedCourse.avgDifficulty) + parseInt(difficulty)) / (reviewedCourse.numScores + 1),
            }
        }
    );

    return reviewedCourse._id;
}


async function updateReactions(courseName, review_id, isLike, change){
    const database = await db.connect(process.env.MONGODB_URI);
    const courses = database.collection('courses');

    const updateOperation = {
        $inc: {
            [isLike ? 'reviews.$.upVotes' : 'reviews.$.downVotes']: change
        }
    };

    const result = await courses.updateOne(
        { name: courseName, 'reviews.id': review_id },
        updateOperation
    );

    return result.acknowledged;
}


async function getAttributions(){
    const database = await db.connect(process.env.MONGODB_URI);
    const attr = database.collection('attributions');

    return await attr.find({}).toArray();
}

module.exports = {
    getDepartments,
    getCourses,
    getCourse,
    insertReview,
    updateReactions,
    getAttributions
};


