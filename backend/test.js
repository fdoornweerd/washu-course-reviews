const { getSchools, getDepartments, getCourses, searchCourses } = require('./functions');

async function test() {
    try {
        // const schools = await getCourses('URBAN DESIGN(A49)');
        const searchResult = await searchCourses('ANTHROPOLOGY(L48)', 'Dating');
        console.log(searchResult);
    } catch (error) {
        console.error('Error:', error);
    }
}
test();