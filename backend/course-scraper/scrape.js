const { Builder, By, Key, until } = require("selenium-webdriver");
const DB = require('../database.js'); 
require('dotenv').config();

// schools to scrape
const SCHOOLS_ALLOWED = ['Architecture','Art','Arts & Sciences','Business','Engineering','Interdisciplinary Programs'];


const DEPARTMENTS_EXCLUDED = [
    'THE GRADUATE SCHOOL(LGS)',
    'OVERSEAS PROGRAMS(L99)',
    'ENGINEERING GRADUATE STUDIES(EGS)'
]

const ATTRIBUTE_SCHOOLS_ALLOWED = ['A&S IQ','Arch','Art','BU','EN'];
const ATTRIBUTE_SCHOOLS_EXCLUDED = ['A&S','Art-Arch','CFH','E LIT','General','Law','Med','UColl','Writing']


const EXCLUDED_CLASSES = [
    'Thesis Research',
    'Degree Project',
    'Workshops',
    'Graduate Studio',
    'Research',
    'Research in Economics',
    'Research in Economics (MA)',
    'Physics I - Sophomores, Juniors, and Seniors Only',
    'Masters Research',
    'Doctoral Research',
    'Undergraduate Honors Thesis',
    'Masters Project',
    `Thesis and Dissertation Research`,
    'Master\'s Thesis',
    `Dissertation Research`,
    'RESEARCH',
    'Independent Study: Internships',
    'Dissertation',
    'Dissertation Research in History'
]




async function getClasses(SEMESTERS_BACK){
    const driver = await new Builder().forBrowser('chrome').build();

    await driver.get('https://courses.wustl.edu/Semester/Listing.aspx');
    await driver.manage().window().setRect({width: 1490,height:820});


    //select semester to update (0 is most recent option)
    const adjusted = 2*SEMESTERS_BACK + 1;

    // click on semester to scrape
    let semester;

    if(SEMESTERS_BACK < 4){
        const semesterBtn = await driver.findElement(By.css('[id="Body_UpdatePanel1"] > a:nth-child('+adjusted+')'));
        semester = await semesterBtn.getText();
        await semesterBtn.click();
        await driver.sleep(3000);
    } else{
        const moreBtn = await driver.findElement(By.css('[id="Body_hlMoreSemesters"]'));
        await moreBtn.click();
        await driver.sleep(3000);

        const semesterBtn = await driver.findElement(By.css('[id="Body_divMoreSems"] > a:nth-child('+(adjusted-8)+')'));
        semester = await semesterBtn.getText();
        await semesterBtn.click();
        await driver.sleep(6000);
    }


    //----------go through each school----------
    const schoolXPath = '//*[@id="Body_upSearchBoxes"]/div/div[1]/div';
    let schoolContainer = await driver.findElement(By.xpath(schoolXPath));
    let schoolLinks = await schoolContainer.findElements(By.css('a'));
    const numSchoolLinks = schoolLinks.length;

    const jsonData = [];
    const departments = [];

    for(let i=0; i<numSchoolLinks; i++){
        
        // update so links dont become stale
        schoolContainer = await driver.findElement(By.xpath(schoolXPath));
        schoolLinks = await schoolContainer.findElements(By.css('a'));

        // get current schools link
        const currLinkS = schoolLinks[i];
        const schoolName = await currLinkS.getText();

        if(!SCHOOLS_ALLOWED.includes(schoolName)){
            continue;
        }
        departments.push([]);

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
            let deptName = await currLinkD.getText();
            if(DEPARTMENTS_EXCLUDED.includes(deptName)){
                continue;
            }

            // random webstac error, forgot the comma
            if(deptName == 'SUPPLY CHAIN, OPERATIONS AND TECHNOLOGY(B57)'){
                deptName = 'SUPPLY CHAIN, OPERATIONS, AND TECHNOLOGY(B57)';
            }

            departments[departments.length-1].push(deptName);

            await driver.actions({ bridge: true }).move({ duration: 500, origin: currLinkD }).perform();

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
                let classLinks = await classContainer.findElements(By.xpath('//*[@id="Body_oCourseList_tabSelect"]/div'));
                const numClassLinks = classLinks.length;

                const num = numClassLinks > 5 ? 5 : numClassLinks;
                
                for(let k=0; k<numClassLinks; k++){
                    // update so links dont become stale
                    classContainer =await driver.findElement(By.xpath(classXPath));
                    let classLinks = await classContainer.findElements(By.xpath('//*[@id="Body_oCourseList_tabSelect"]/div'));

                    // get current classLink
                    const currLinkC = classLinks[k];

                    // get name/code of class
                    const classCodeLink = await currLinkC.findElement(By.css('table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > a'));
                    const classNameLink = await currLinkC.findElement(By.css('table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > a'));
                    const codeName = await classCodeLink.getText();
                    const className = await classNameLink.getText();

                    if(className == 'Physics I - First-Years Only'){
                        className = 'Physics I';
                    }

                    if(EXCLUDED_CLASSES.includes(className)){
                        continue;
                    }

                    // get details for course
                    
                    const expandDetailsBtn = await currLinkC.findElement(By.css('table > tbody > tr > td:nth-child(2) > div > table > tbody > tr > td:nth-child(1) > a'));

                    //hover over button and then click
                    await driver.actions({ bridge: true }).move({ duration: 250, origin: expandDetailsBtn }).perform();
                    //expand
                    await expandDetailsBtn.click();
                    
                    const courseDetailsLink = await currLinkC.findElement(By.css('div.DivDetail > table > tbody > tr > td:nth-child(2) > table:nth-child(1) > tbody > tr > td:nth-child(2) > a'));
                    const courseDetails = await courseDetailsLink.getText();

                    //get attributes
                    const attributesArray = [];
                    let attrIdx = -1;
                    let onAcceptedSchool = false;

                    const courseAttributesLink = await currLinkC.findElements(By.css('div.DivDetail > table > tbody > tr > td:nth-child(2) > table:nth-child(2) > tbody > tr > td:nth-child(2) > a'));
                    for(const attr of courseAttributesLink){
                        const text = await attr.getText();
                        if(ATTRIBUTE_SCHOOLS_ALLOWED.includes(text)){
                            onAcceptedSchool = true;
                            attrIdx+=1;
                            if(text == 'A&S IQ'){
                                attributesArray.push({'attributeSchool': 'A&S', 'attributeList': []});
                            }else{
                                attributesArray.push({'attributeSchool': text, 'attributeList': []});
                            }
                        } else{
                            if(!ATTRIBUTE_SCHOOLS_EXCLUDED.includes(text) && onAcceptedSchool){
                                attributesArray[attrIdx].attributeList.push(text);
                            }else{
                                onAcceptedSchool = false;
                            }
                        }
                    }


                    

                    // get sections of class (could be 1 or more)
                    const sections = await currLinkC.findElements(By.css('div.ResultTable > table > tbody > tr > td:nth-child(2) > div'));
                    
                    
                    // holds the potential instructors for the course
                    const insturctorsForCourse = [];

                    const instructorNames = [];
                    // go through each section
                    
                    for(const section of sections){
                        // make sure instructor is for class and not subsection
                        const sectionNum = await section.findElement(By.css('table > tbody > tr:nth-child(1) > td:nth-child(2)')).getText();
                        // Dont insert subsection leaders
                        if(/[A-Z]/.test(sectionNum)){
                            continue;
                        }


                        // get the instructors labeled for the section
                        const instructorContainer = await section.findElement(By.css('table > tbody > tr:nth-child(1) > td:nth-child(6)'));
                        const instructorLink = await instructorContainer.findElements(By.css('a'));

                        // go through each instructor for the course (1 or more) and click on their name to get full name
                        if(instructorLink.length > 0){
                            // hover to prevent shifting text issue
                            await driver.actions({ bridge: true }).move({ duration: 300, origin: section }).perform();

                            // if same instructor is teaching multiple sections no need to click on their name multiple times
                            for(const instructor of instructorLink) {
                                const instructorLastName = await instructor.getText()
                            
                                 // click on instuctor to get brought to profile
                                 await instructor.click();
                
                                 //switch windows
                                 let windowHandles = await driver.getAllWindowHandles();
                                    
                                 // Switch to the newly opened tab
                                 await driver.switchTo().window(windowHandles[windowHandles.length - 1]);
                                
                                 
                                 

                                 //get FULL instructor name 
                                 let element;
                                 try {
                                    // await for instructor page to load
                                    await driver.wait(until.titleIs('Instructor Courses'), 20000);
                                    element = await driver.wait(until.elementLocated(By.id('oInstructorResults_lblInstructorName')), 20000);
                                 } catch(err){
                                    // couldn't click on name so click again and do steps
                                    instructor.click(); //HERE IS ISSUE
                                    windowHandles = await driver.getAllWindowHandles();
                                    await driver.switchTo().window(windowHandles[windowHandles.length - 1]);
                                    try{
                                        // await for instructor page to load
                                        await driver.wait(until.titleIs('Instructor Courses'), 20000);
                                        element = await driver.wait(until.elementLocated(By.id('oInstructorResults_lblInstructorName')), 20000);
                                    } catch (err){
                                        continue;
                                    }
                                    
                                 }
                                
                                 const fullName = await element.getText();
                        
                                // close current window
                                await driver.close();
                                    
                                // switch back to courses
                                await driver.switchTo().window(windowHandles[0]); 
                                    
                                // add instructor if it doesnt exist already
                                if(!insturctorsForCourse.includes(fullName)){
                                    insturctorsForCourse.push(fullName);
                                    instructorNames.push({"lastName":instructorLastName,"fullName":fullName, "semestersTaught":[semester]});
                                }
                            }
                        } 
                    }


                    console.log(`${deptName} ${className}`);

                    jsonData.push(
                        {
                            "code": [codeName],
                            "name": className,
                            "department": [deptName],
                            "instructors": instructorNames,
                            "courseDetails":courseDetails,
                            "attributes": attributesArray,
                            "lastOffered": semester,
                            "numScores": 0,
                            "avgDifficulty": 0,
                            "avgQuality": 0,
                            "reviews": []
                        }
                    );
                }
            }
        }
    }

    return [semester, jsonData, departments];
}



async function run() {
   const database = await DB.connect(process.env.MONGODB_URI);
   const SEMESTERS_BACK = [1];

    try {
    for(const semesterBack of SEMESTERS_BACK){

        const [semester,coursesData, departments] = await getClasses(semesterBack);
    
    
    
        // go through each department
        const depts = database.collection('departments');
        for(let i=0; i<departments.length; i++){
            for(let j=0; j<departments[i].length; j++){
                if(departments[i][j] == 'All Departments(All)'){
                    continue;
                }
                const courseFilter = { school: SCHOOLS_ALLOWED[i], department: departments[i][j] }
                const existingDept = await depts.findOne(courseFilter);
    
                if(!existingDept){
                    const result = await depts.insertOne({school: SCHOOLS_ALLOWED[i], department:departments[i][j]});
                    console.log(`Inserted department: ${departments[i][j]}`);
                }
            }
        }
    
    
    
    
    
        // go through each course
        const courses = database.collection('courses');
        for(const course of coursesData){
            // get course from database with unqiue course code
            const courseFilter = { name: course.name }
            const existingCourse = await courses.findOne(courseFilter);
    
            if(!existingCourse){
                // if it doesnt exist insert it
                const result = await courses.insertOne(course);
                console.log(`Inserted course: ${course.department[0]} - ${course.name}`);
            } else{
    
                // check if course code is different and add it to list and coresponding department
                if(!existingCourse.code.includes(course.code[0])){
                    let updatedCodes = [...existingCourse.code,course.code[0]];
                    let updatedDepartments = [...existingCourse.department,course.department[0]];
                    const update = {
                        $set: { 
                            code: updatedCodes,
                            department: updatedDepartments
                            }
                    };
                    const updateResult = await courses.updateOne(courseFilter, update);
    
                    // log update
                    console.log(`Updated course codes for: ${course.department[0]} - ${course.name} - ${course.code}`);
                }
    
    
    
    
    
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
                    console.log(`Updated course for: ${course.department[0]} - ${course.name} - ${updatedInDB}`);
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
                    console.log(`Updated most recently offered course for ${course.department[0]} - ${course.name} - ${semesterIncoming}`);
               } else if(yearIncoming == yearDB){
                    const semesterOrder = ["SP","SU","FL"];
                    if(semesterOrder.indexOf(semesterTypeDB) < semesterOrder.indexOf(semesterTypeIncoming)){
                        // more recent semester
                        const update = {
                            $set: {lastOffered: semesterIncoming}
                        }
                        const updateResult = await courses.updateOne(courseFilter, update);
                        console.log(`Updated most recently offered course for ${course.department[0]} - ${course.name} - ${semesterIncoming}`);
                    }
               }
    
    
    
               // check for updated course description
    
               if(course.courseDetails != existingCourse.courseDetails){
                    const update = {
                        $set: {courseDetails: course.courseDetails}
                    }
                    const updateResult = await courses.updateOne(courseFilter, update);
                    console.log(`Updated course description for ${course.department[0]} - ${course.name}`);
               }


               // use most updated attributes for courses
               const update = {
                    $set: {attributes: course.attributes}
                }
                const updateResult = await courses.updateOne(courseFilter, update);


                // add course attribute if not there already
                const attr = database.collection('attributions');

                for(let i=0; i<course.attributes.length; i++){
                    for(let j=0; j<course.attributes[i].attributeList.length; j++){
                        const existingAttr = await attr.findOne({ school: course.attributes[i].attributeSchool, attribute: course.attributes[i].attributeList[j] });

                        if(!existingAttr){
                            const result = await attr.insertOne({school: course.attributes[i].attributeSchool, attribute: course.attributes[i].attributeList[j]});
                            console.log(`Inserted Attribution: ${course.attributes[i].attributeSchool} - ${course.attributes[i].attributeList[j]}`);
                        }
                    }

                }
               
            }
        }
    }


    } finally {
        await DB.close();

    }
}



run().catch(console.dir);

