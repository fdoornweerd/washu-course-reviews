const { Builder, By, Key, until } = require("selenium-webdriver");
const { MongoClient } = require("mongodb");
require('dotenv').config();



async function getClasses(){
    const driver = await new Builder().forBrowser('chrome').build();

    await driver.get('https://courses.wustl.edu/Semester/Listing.aspx');

    // schools to scrape
    const schoolsAllowed = ['Architecture','Art','Arts & Sciences','Business','Engineering','Interdisciplinary Programs'];


    //select semester to update (0 is most recent option)
    const SEMESTERS_BACK = 0;
    const adjusted = 2*SEMESTERS_BACK + 1;

    // click on semester to scrape
    let semester;

    if(SEMESTERS_BACK < 4){
        const semesterBtn = await driver.findElement(By.css('[id="Body_UpdatePanel1"] > a:nth-child('+adjusted+')'));
        semester = await semesterBtn.getText();
        await semesterBtn.click();
        await driver.sleep(1000);
    } else{
        const moreBtn = await driver.findElement(By.css('[id="Body_hlMoreSemesters"]'));
        await moreBtn.click();
        await driver.sleep(1000);

        const semesterBtn = await driver.findElement(By.css('[id="Body_divMoreSems"] > a:nth-child('+(adjusted-8)+')'));
        semester = await semesterBtn.getText();
        await semesterBtn.click();
        await driver.sleep(2000);
    }


    //----------go through each school----------
    const schoolXPath = '//*[@id="Body_upSearchBoxes"]/div/div[1]/div';
    let schoolContainer = await driver.findElement(By.xpath(schoolXPath));
    let schoolLinks = await schoolContainer.findElements(By.css('a'));
    const numSchoolLinks = schoolLinks.length;

    const jsonData = [];

    for(let i=0; i<2; i++){
        // update so links dont become stale
        schoolContainer = await driver.findElement(By.xpath(schoolXPath));
        schoolLinks = await schoolContainer.findElements(By.css('a'));

        // get current schools link
        const currLinkS = schoolLinks[i];
        const schoolName = await currLinkS.getText();

        if(!schoolsAllowed.includes(schoolName)){
            continue;
        }

        // click on school
        await currLinkS.click();

        //----------go through each department----------
        const departmentXPath = '/html/body/form/div[7]/div/div[2]/div[1]/div/div[2]';
        let deptContainer = await driver.findElement(By.xpath(departmentXPath));
        let deptLinks = await deptContainer.findElements(By.css('a'));
        const numDeptLinks = deptLinks.length;


        for(let j=0; j<numDeptLinks; j++){
            // update so links dont become stale
            deptContainer = await driver.findElement(By.xpath(departmentXPath));
            deptLinks = await deptContainer.findElements(By.css('a'));
    
            const currLinkD = deptLinks[j];
            const deptName = await currLinkD.getText();

            if(deptName != 'All Departments(All)'){
                await currLinkD.click();

                // Wait for classes to load and loading bar to go away
                let imgElement = await driver.findElement(By.id('imgload'));
                let styleAttribute = await imgElement.getAttribute('style');
                
                while (styleAttribute.includes('display: inline;')) {
                    await driver.sleep(500);
                    styleAttribute = await imgElement.getAttribute('style');
                }


                //----------go through each class----------
                const classXPath = '//*[@id="Body_oCourseList_viewSelect"]';
                let classContainer = await driver.findElement(By.xpath(classXPath));
                let classLinks = await classContainer.findElements(By.css('div.CrsOpen'));
                const numClassLinks = classLinks.length;

                const num = numClassLinks > 5 ? 5 : numClassLinks
                
                for(let k=0; k<num; k++){
                    // update so links dont become stale
                    classContainer = await driver.findElement(By.xpath(classXPath));
                    classLinks = await classContainer.findElements(By.css('div.CrsOpen'));
            
                    // get current classLink
                    const currLinkC = classLinks[k];

                    // get name/code of class
                    const classCodeLink = await currLinkC.findElement(By.css('table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > a'));
                    const classNameLink = await currLinkC.findElement(By.css('table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > a'));
                    const codeName = await classCodeLink.getText();
                    const className = await classNameLink.getText();

                    // get details for course
                    const expandDetailsBtn = await currLinkC.findElement(By.css('table > tbody > tr > td:nth-child(2) > div > table > tbody > tr > td:nth-child(1) > a'));
                    //expand
                    await expandDetailsBtn.click();
                    await driver.sleep(250);
                    const courseDetailsLink = await currLinkC.findElement(By.css('div.DivDetail > table > tbody > tr > td:nth-child(2) > table:nth-child(1) > tbody > tr > td:nth-child(2) > a'));
                    const courseDetails = await courseDetailsLink.getText();
                    //close
                    await expandDetailsBtn.click();
                    // get sections of class (could be 1 or more)
                    const sections = await currLinkC.findElements(By.css('div.ResultTable > table > tbody > tr > td:nth-child(2) > div'));
                    
                    
                    // holds the potential instructors for the course
                    const insturctorsForCourse = [];

                    const instructorNames = [];
                    // go through each section
                    
                    for(const section of sections){
                        // get the instructors labeled for the section
                        const instructorContainer = section.findElement(By.css('table > tbody > tr:nth-child(1) > td:nth-child(6)'));
                        const instructorLink = await instructorContainer.findElements(By.css('a'));

                        
                        // go through each instructor for the course (1 or more) and click on their name to get full name
                        if(instructorLink.length > 0){
                            // if same instructor is teaching multiple sections no need to click on their name multiple times
                            for(const instructor of instructorLink) {
                                const instructorLastName = await instructor.getText()
                                if(!insturctorsForCourse.includes(instructorLastName)){
                                    insturctorsForCourse.push(instructorLastName);

                                    // hover to prevent shifting text issue
                                    await driver.actions({ bridge: true }).move({ duration: 250, origin: section }).perform();

                                    // click on instuctor to get brought to profile
                                    await instructor.click();
                    
                                

                                    //switch windows
                                    const windowHandles = await driver.getAllWindowHandles();
                                    
                                    // Switch to the newly opened tab
                                    await driver.switchTo().window(windowHandles[windowHandles.length - 1]);
                                

                                    //get FULL instructor name 
                                    const element = await driver.wait(until.elementLocated(By.id('oInstructorResults_lblInstructorName')), 20000);
                                    const fullName = await element.getText();
                        
                                    // close current window
                                    await driver.close();
                                    
                                    // switch back to courses
                                    await driver.switchTo().window(windowHandles[0]); 
                                    
                                    // add instructor
                                    instructorNames.push({"lastName":instructorLastName,"fullName":fullName, "semestersTaught":[semester]});
                                }
                            }
                        }
                    }


                    console.log(`${codeName} ${className}`);

                    jsonData.push(
                        {
                            "code": codeName,
                            "name": className,
                            "department": deptName,
                            "school": schoolName,
                            "instructors": instructorNames,
                            "courseDetails":courseDetails,
                            "lastOffered": semester,
                            "numScores": 0,
                            "meanScore": -1,
                            "minInstructorScore": -1,
                            "maxInstructorScore": -1,
                            "reviews": []
                        }
                    );
                }
            }
        }
    }

    return [semester, jsonData];
}


// Replace the uri string with your connection string.
const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function run() {
  try {
    const [semester,coursesData] = await getClasses();
    
    // insert courses into db
    const database = client.db('RateMyCourse');
    const courses = database.collection('courses');

    // go through each course
    for(const course of coursesData){
        // get course from database with unqiue course code
        const courseFilter = { code: course.code }
        const existingCourse = await courses.findOne(courseFilter);
        if(!existingCourse){
            // if it doesnt exist insert it
            const result = await courses.insertOne(course);
            console.log(`Inserted course: ${course.code} - ${course.name} - ${course.department}`);
        } else{

            let addedSemester = false;

            // check for instructors associated with the course who may have started teaching it
           const instructorInDB = existingCourse.instructors;
           const newInstructors = course.instructors.filter(el => {
            // if instructor isnt in database return true
            // no need to add a semester taught because it isnt present
            if (!instructorInDB.some(dbEl => dbEl.lastName === el.lastName && dbEl.fullName === el.fullName)) {
                return true;
            } else {
                // instructor is already in DB
                const matchingInstructor = instructorInDB.find(dbEl => dbEl.fullName === el.fullName);
                // check if instructor has already been added to have been teaching course
                if(!matchingInstructor.semestersTaught.includes(semester)){
                    // if not add new semester
                    matchingInstructor.semestersTaught.push(semester);
                    const idx = instructorInDB.findIndex(dbEl => dbEl.fullName === el.fullName);

                    // add back to database
                    instructorInDB[idx] = matchingInstructor;
                    addedSemester = true;

                }
            
                return false; 
            }
        });

           let updatedInstructors = newInstructors.concat(instructorInDB);


            let updatedInDB = "";
            newInstructors.forEach(instructor => {
                updatedInDB+=(instructor.lastName+" ");
            });
            if(addedSemester){
                updatedInDB+=semester;
            }
            if(updatedInDB!=""){
                const update = {
                    $set: { 
                        instructors: updatedInstructors,
                        }
                };
                const updateResult = await courses.updateOne(courseFilter, update);

                // log update
                console.log(`Updated course for: ${course.code} - ${course.name} - ${course.department} - ${updatedInDB}`);
            }
            



           //check if course was offered more recently
           const semesterDB = existingCourse.lastOffered;
           const semesterTypeDB = semesterDB.substring(0, 2); 
           const yearDB = parseInt(semesterDB.substring(2));

           const semesterIncoming = course.lastOffered;
           const semesterTypeIncoming = semesterIncoming.substring(0, 2); 
           const yearIncoming = parseInt(semesterIncoming.substring(2));
           
           if(yearIncoming > yearDB){
            // more recent year
                const update = {
                    $set: {lastOffered: semesterIncoming}
                }
                const updateResult = await courses.updateOne(courseFilter, update);
                console.log(`Updated most recently offered course for ${course.code} - ${course.name} - ${course.department} - ${semesterIncoming}`);
           } else if(yearIncoming == yearDB){
                const semesterOrder = ["SP","SU","FL"];
                if(semesterOrder.indexOf(semesterTypeDB) < semesterOrder.indexOf(semesterTypeIncoming)){
                    // more recent semester
                    const update = {
                        $set: {lastOffered: semesterIncoming}
                    }
                    const updateResult = await courses.updateOne(courseFilter, update);
                    console.log(`Updated most recently offered course for ${course.code} - ${course.name} - ${course.department} - ${semesterIncoming}`);
                }
           }



           // check for updated course description

           if(course.courseDetails != existingCourse.courseDetails){
                const update = {
                    $set: {courseDetails: course.courseDetails}
                }
                const updateResult = await courses.updateOne(courseFilter, update);
                console.log(`Updated course description for ${course.code} - ${course.name} - ${course.department}`);
           }
           
        }
    }


  } finally {
    await client.close();
  }
}



run().catch(console.dir);

