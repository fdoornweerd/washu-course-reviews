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

    const schools = [];
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

        const departments = [];
        for(let j=0; j<numDeptLinks; j++){
            // update so links dont become stale
            deptContainer = await driver.findElement(By.xpath(departmentXPath));
            deptLinks = await deptContainer.findElements(By.css('a'));
    
            const currLinkD = deptLinks[j];
            const deptName = await currLinkD.getText();
            const classes = [];
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


                
                for(let k=0; k<numClassLinks; k++){
                    // update so links dont become stale
                    classContainer = await driver.findElement(By.xpath(classXPath));
                    classLinks = await classContainer.findElements(By.css('div.CrsOpen'));
            
                    const currLinkC = classLinks[k];

                    const classCodeLink = await currLinkC.findElement(By.css('table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > a'));
                    const classNameLink = await currLinkC.findElement(By.css('table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > a'));

                    const codeName = await classCodeLink.getText();
                    const className = await classNameLink.getText();
                    
                    console.log(`${codeName} ${className}`);
                    classes.push([codeName,className]);
                }
                departments.push([deptName, classes]);
            }
        }
        schools.push([schoolName,departments]);
    }

    return schools;
}




// Replace the uri string with your connection string.
const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function run() {
  try {

    const courses = await getClasses();

    const database = client.db('sample_mflix');
    const movies = database.collection('movies');

    // Query for a movie that has the title 'Back to the Future'
    const query = { title: 'Back to the Future' };
    const movie = await movies.findOne(query);

    console.log(movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}


run().catch(console.dir);

