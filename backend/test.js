const { getSchools, getDepartments, getCourses, searchCourses,insertReview, fetchReviews } = require('./functions');

async function test() {
    try {
        // const schools = await getCourses('URBAN DESIGN(A49)');
        //const searchResult = await searchCourses('all', 't Morgan');
        //console.log(searchResult);

        //console.log(await insertReview(5,1,"mom", "B", "efw","1","1","A46 ARCH 111C"));
        console.log(await fetchReviews("A46 ARCH 111C", "mom"))
    } catch (error) {
        console.error('Error:', error);
    }

    
}
test();