const { Builder, By, until } = require("selenium-webdriver");
const { MongoClient } = require("mongodb");
require('dotenv').config();



async function getClasses(){
    const driver = await new Builder().forBrowser('chrome').build();

    await driver.get('https://courses.wustl.edu/Semester/Listing.aspx');

    //----------go through each school----------
    const schoolXPath = '//*[@id="Body_upSearchBoxes"]/div/div[1]/div';
    let schoolContainer = await driver.findElement(By.xpath(schoolXPath));
    let schoolLinks = await schoolContainer.findElements(By.css('a'));
    const numSchoolLinks = schoolLinks.length;

    const jsonData = [];

    for(let i=0; i<1; i++){
        // update so links dont become stale
        schoolContainer = await driver.findElement(By.xpath(schoolXPath));
        schoolLinks = await schoolContainer.findElements(By.css('a'));

        const currLinkS = schoolLinks[i];
        const schoolName = await currLinkS.getText();

        await currLinkS.click();

        //----------go through each department----------
        const departmentXPath = '/html/body/form/div[7]/div/div[2]/div[1]/div/div[2]';
        let deptContainer = await driver.findElement(By.xpath(departmentXPath));
        let deptLinks = await deptContainer.findElements(By.css('a'));
        const numDeptLinks = deptLinks.length;


        for(let j=0; j<2; j++){
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


                
                for(let k=0; k<3; k++){
                    // update so links dont become stale
                    classContainer = await driver.findElement(By.xpath(classXPath));
                    classLinks = await classContainer.findElements(By.css('div.CrsOpen'));
            
                    const currLinkC = classLinks[k];

                    const classCodeLink = await currLinkC.findElement(By.css('table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > a'));
                    const classNameLink = await currLinkC.findElement(By.css('table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > a'));
                    const codeName = await classCodeLink.getText();
                    const className = await classNameLink.getText();

                        
                    const instructorContainer = await currLinkC.findElement(By.css('div.ResultTable > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(1) > td:nth-child(6)'));
                    const instructorLink = await instructorContainer.findElements(By.css('a'));

                    let instructorNames = [];
                    
                    if(instructorLink.length > 0){
                        for (const instructor of instructorLink) {
                            instructorNames.push(await instructor.getText());
                        }
                    } else{
                        // if instructor is [TBD] there won't be an <a> element

                        // for now dont do anything with [TBD Values]
                        // instructorNames.push(await instructorContainer.getText());
                    }


                    console.log(`${codeName} ${className} ${instructorNames}`);

                    jsonData.push(
                        {
                            "code": codeName,
                            "name": className,
                            "department": deptName,
                            "school": schoolName,
                            "instructors": instructorNames
                        }
                    );
                }
            }
        }
    }

    return jsonData;
}




// Replace the uri string with your connection string.
const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function run() {
  try {

    const coursesData = await getClasses();

    // insert into db
    const database = client.db('class-critique');
    const courses = database.collection('courses');

    for(const course of coursesData){
        const existingCourse = await courses.findOne({ code: course.code });
        if(!existingCourse){
            const result = await courses.insertOne(course);
            console.log(`Inserted course: ${course.code} - ${course.name} - ${course.department}`);
        } else{
           const instructorInDB = existingCourse.instructors;
           const newInstructors = course.instructors.filter(el => !instructorInDB.includes(el));
           const updatedInstructors = newInstructors.concat(instructorInDB);
           
           if(newInstructors.length > 0){
                const filter = { code: course.code };
                const update = {
                    $set: { instructors: updatedInstructors }
                };
                const updateResult = await courses.updateOne(filter, update);

                console.log(`Updated course instructors for: ${course.code} - ${course.name} - ${course.department} - ${updatedInstructors}`);
           }
        }
    }


  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}


run().catch(console.dir);

