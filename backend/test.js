const { getSchools, getDepartments, getCourses,insertReview, fetchReviews,updateReactions, getAttributions } = require('./functions');
const db = require('./database.js'); 
require('dotenv').config();


async function test() {
    try {
        const dep = await getDepartments('Architecture')
        // const schools = await getCourses('URBAN DESIGN(A49)');
        //const searchResult = await searchCourses('all', 't Morgan');
        //console.log(searchResult);

        // console.log(await insertReview(5,1,["mr. mark"], "B", "This class is not good at all because the professor is always late and doesnt pay attention to the students at all. The class isnt that hard but is made hard because of how bad the professor is.","1","1","A46 ARCH 175"));
        // console.log(await insertReview(5,1,["dad","mr. mark"], "B", "The professor wasnt very good in class but was super helpful during office hours. The material of this class is kind of boring and is hard to pay attention to. I wish i didnt take it.","1","1","A46 ARCH 175"));
        // console.log(await insertReview(5,1,["mom","mr. mark"], "B", "I HATE THIS CLASS. the professor didnt care about the students at all, and the tests are super hard and not like the practice exams. I would sometimes go to office hours but he was never helpful during them, and didnt seem like he cared at all. This class has been the worst of my entire college experience.","1","1","A46 ARCH 175"));
        // console.log(await fetchReviews("A46 ARCH 175", "mr. mark"))

       // console.log(await getCourses("Architecture", "LANDSCAPE ARCHITECTURE(A48)"))
    //    let c = await getAttributions();
    //    console.log(c);
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
        console.log(allCourses);
        
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