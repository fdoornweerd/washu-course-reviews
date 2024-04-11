const { MongoClient } = require("mongodb");
require('dotenv').config();

export async function getSchools(){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('class-critique');
    const courses = database.collection('courses');

    try{
        return await courses.distinct('school');
    
    } catch (err){
        console.error('Error fetching unique departments:', err);
        return [];
    } finally {
        await client.close();
    }
}



export async function getDepartments(school){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('class-critique');
    const courses = database.collection('courses');

    try{
        const filter = {school: school};
        return await courses.distinct('department',filter);
    
    } catch (err){
        console.error('Error fetching unique departments:', err);
        return [];
    } finally {
        await client.close();
    }
}


// make the department 'all' to get all courses (for search feature)
export async function getCourses(department){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('class-critique');
    const courses = database.collection('courses');

    try{
        if(department == 'all'){
            return await courses.find().toArray();
        } else{
            return await courses.find({department: department}).toArray();
        }
        
    
    } catch (err){
        console.error('Error fetching unique departments:', err);
        return [];
    } finally {
        await client.close();
    }
}




module.exports = {
    getSchools: getSchools,
    getDepartments: getDepartments,
    getCourses: getCourses,

};


// FOR TESTING
// to test just dont make them export (just async functions)

// async function test() {
//     try {
//         const schools = await getCourses('URBAN DESIGN(A49)');
//         console.log(schools);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }
// test();