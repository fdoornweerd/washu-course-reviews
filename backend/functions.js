const { MongoClient } = require("mongodb");
require('dotenv').config();


// returns all schools in database
async function getSchools(){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('class-critique');
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
    const database = client.db('class-critique');
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
async function getCourses(department){
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
        console.error('Error fetching courses:', err);
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
    const database = client.db('class-critique');
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





module.exports = {
    getSchools,
    getDepartments,
    getCourses,
    searchCourses,
    getProfessorLink
};


