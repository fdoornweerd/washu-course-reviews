const { MongoClient } = require("mongodb");
const OpenAI = require("openai");
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
    const courses = database.collection('courses');

    try{
        const filter = {school: school};
        return await courses.distinct('department',filter);
    
    } catch (err){
        console.error('Error fetching departments:', err);
        return [];
    } finally {
        await client.close();
    }
}

// returns all courses in a department
// make the department 'all' to get all courses
async function getCourses(school, department){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('RateMyCourse');
    const courses = database.collection('courses');

    try{
        if(department == 'all'){
            return await courses.find().toArray();
        } else{
            return await courses.find({department: department, school: school}).toArray();
        }
        
    
    } catch (err){
        console.error('Error fetching courses:', err);
        return [];
    } finally {
        await client.close();
    }
}

async function getCourse(school, department, name){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('RateMyCourse');
    const courses = database.collection('courses');

    try{
        return await courses.findOne({department: department, school: school, name: name});
    
    } catch (err){
        console.error('Error fetching course:', err);
        return [];
    } finally {
        await client.close();
    }
}

// searches courses for either the name of the course or course code
// if searching all classes, put department as 'all'
async function searchCourses(department, searchTerm){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('RateMyCourse');
    const courses = database.collection('courses');

    try{
        const regex = new RegExp(searchTerm, 'i');
        

        if(department == 'all'){
            const results = await courses.find({
                $or: [
                    { name: {$regex: regex}},
                    { code: {$regex: regex}},
                    { "instructors.fullName": { $regex: regex } }
                ]
            }).toArray();

            return results;
        } else{
            const results = await courses.find({
                $or: [
                    { name: { $regex: regex } },
                    { code: { $regex: regex } },
                    { "instructors.fullName": { $regex: regex } }
                ],
                department: department
            }).toArray();

            return results;
        }
    } catch (err){
        console.error('Error searching:', err);
        return [];
    } finally {
        await client.close();
    }
}



function getProfessorLink(fullName){
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[1];
    return `https://www.ratemyprofessors.com/search/professors/1147?q=${firstName}%20${lastName}`;
}



// TODO: figure out how to grab dateposted and how to track userID so they cant comment a lot (once per session or something?)
// quality (num 1-5) difficulty (num 1-5 ) instructor (array of last names) grade (letter grade)
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




async function summarizeReviews(courseName) {
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('RateMyCourse');
    const courses = database.collection('courses');

    const result = await courses.findOne(
        {name: courseName}
    )
    await client.close();


    let reviews;
    if(result == null){
        reviews = [];
    } else{
        reviews = result.reviews || [];
    }

    let reviewString = "";
    for(let i=0; i<reviews.length; i++){
        reviewString+= `review ${i+1}: ${reviews[i].comment}`
    }

   

    const openai = new OpenAI({
        apiKey: process.env.OPEN_AI_KEY,
    });

    const chatCompletion = await openai.chat.completions.create({
        messages: [
            {role: "system", content: "You are an assistant that takes in a list of reviews, and then outputs a sumarized version of the reviews in no more than 3 sentences. If the string is empty output 'there are no reviews yet'"},
            { role: "user", content: reviewString}
        ],
        model: "gpt-3.5-turbo",
    });

  return chatCompletion.choices[0].message.content;
}




module.exports = {
    getSchools,
    getDepartments,
    getCourses,
    getCourse,
    searchCourses,
    getProfessorLink,
    insertReview,
    fetchReviews,
    summarizeReviews
};


