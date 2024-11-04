const { getSchools, getDepartments, getCourses,insertReview, fetchReviews,updateReactions, getAttributions } = require('./functions.js');
const db = require('./database.js'); 
require('dotenv').config();


async function test() {
    try {
        console.log(await countReviews());
    } catch (error) {
        console.error('Error:', error);
    }

    
}


async function countReviews(){
    let reviewNum = 0;
    try{
        const database = await db.connect(process.env.MONGODB_URI);
        const courses = database.collection('courses');
    
        const allCourses = await courses.find().toArray();;
        
        for(c of allCourses){
            reviewNum+=c.reviews.length;
        }
        
    } catch(err){
        console.log(err);
    } finally{
        return reviewNum;
    }

}




test();