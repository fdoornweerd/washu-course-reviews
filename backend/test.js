const { getSchools, getDepartments, getCourses, searchCourses,insertReview, fetchReviews,summarizeReviews } = require('./functions');

async function test() {
    try {
        // const schools = await getCourses('URBAN DESIGN(A49)');
        //const searchResult = await searchCourses('all', 't Morgan');
        //console.log(searchResult);

        // console.log(await insertReview(5,1,"mr. mark", "B", "This class is not good at all because the professor is always late and doesnt pay attention to the students at all. The class isnt that hard but is made hard because of how bad the professor is.","1","1","A46 ARCH 175"));
        // console.log(await insertReview(5,1,"mr. mark", "B", "The professor wasnt very good in class but was super helpful during office hours. The material of this class is kind of boring and is hard to pay attention to. I wish i didnt take it.","1","1","A46 ARCH 175"));
        // console.log(await insertReview(5,1,"mr. mark", "B", "I HATE THIS CLASS. the professor didnt care about the students at all, and the tests are super hard and not like the practice exams. I would sometimes go to office hours but he was never helpful during them, and didnt seem like he cared at all. This class has been the worst of my entire college experience.","1","1","A46 ARCH 175"));
        //console.log(await fetchReviews("A46 ARCH 111C", "mom"))
        console.log(await summarizeReviews("A46 ARCH 175"));
    } catch (error) {
        console.error('Error:', error);
    }

    
}
test();