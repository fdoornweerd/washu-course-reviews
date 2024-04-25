const { MongoClient } = require("mongodb");
require('dotenv').config();


// returns all schools in database
async function getSchools(){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('RateMyCourse');
    const courses = database.collection('courses');

    try{
        return await courses.distinct('school');
    
    } catch (err){
        console.error('Error fetching schools:', err);
        return [];
    } finally {
        await client.close();
    }
}


// returns all departments for a school in database
async function getDepartments(school){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('RateMyCourse');
    const depts = database.collection('departments');

    try{

        return await depts.distinct("department",{school:school});

    } catch (err){
        console.error('Error fetching departments:', err);
        return [];
    } finally {
        await client.close();
    }
}

// returns all courses in a department
// make the department 'all' to get all courses
async function getCourses(department){

    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('RateMyCourse');
    const courses = database.collection('courses');

    try{
        if(department == 'all'){
            return await courses.find().sort({ numScores: -1 }).toArray();
        } else{
            return await courses.find({department: department}).sort({ numScores: -1 }).toArray();
        }
        
    
    } catch (err){
        console.error('Error fetching courses:', err);
        return [];
    } finally {
        await client.close();
    }
}

async function getCourse(name){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('RateMyCourse');
    const courses = database.collection('courses');

    try{
        return await courses.findOne({name: name});
    
    } catch (err){
        console.error('Error fetching course:', err);
        return [];
    } finally {
        await client.close();
    }
}




async function insertReview(quality, difficulty, instructor, hours, comment, datePosted, courseName){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('RateMyCourse');
    const courses = database.collection('courses');

    JSON_review = {
        "quality": quality,
        "difficulty": difficulty,
        "instructor": instructor,
        "hours": hours,
        "comment": comment,
        "date": datePosted
    }

    const reviewedCourse = await courses.findOne({name: courseName});


    const result = await courses.updateOne(
        { name: courseName },
        { 
            $push: { reviews: JSON_review},
            $set: {
                numScores: reviewedCourse.numScores + 1,
                avgQuality: ((reviewedCourse.numScores*reviewedCourse.avgQuality)+parseInt(quality))/(reviewedCourse.numScores + 1),
                avgDifficulty: ((reviewedCourse.numScores*reviewedCourse.avgDifficulty)+parseInt(difficulty))/(reviewedCourse.numScores + 1),
            }
        }
    );

    await client.close();

    return result.acknowledged;
}

// set instructor to 'all' if getting all reviews
async function fetchReviews(courseName, instructor){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('RateMyCourse');
    const courses = database.collection('courses');

    const result = await courses.findOne(
        {name: courseName}
    )

    let reviews;
    if(result == null){
        reviews = [];
    } else{
        reviews = result.reviews || [];
    }

    if(instructor == 'all'){
        await client.close();
        return reviews;
    } else {
        const filteredReviews = reviews.filter(el => el.instructor.includes(instructor));
        await client.close();
        return filteredReviews;
    }
}







module.exports = {
    getSchools,
    getDepartments,
    getCourses,
    getCourse,
    insertReview,
    fetchReviews,
};


