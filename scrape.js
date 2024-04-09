const { Builder, By, until } = require("selenium-webdriver");


async function getClasses(){
    const driver = await new Builder().forBrowser('chrome').build();

    await driver.get('https://courses.wustl.edu/Semester/Listing.aspx');


    const schoolXPath = '//*[@id="Body_upSearchBoxes"]/div/div[1]/div';
    let schoolContainer = await driver.findElement(By.xpath(schoolXPath));
    let schoolLinks = await schoolContainer.findElements(By.css('a'));
    const numSchoolLinks = schoolLinks.length;

    const data = [];
    //go through each school
    for(let i=0; i<1; i++){

        // update so links dont become stale
        schoolContainer = await driver.findElement(By.xpath(schoolXPath));
        schoolLinks = await schoolContainer.findElements(By.css('a'));

        const schoolDepts = [];
        const currLinkS = schoolLinks[i];
        const schoolName = await currLinkS.getText();





        const departmentXPath = '/html/body/form/div[7]/div/div[2]/div[1]/div/div[2]';
        let deptContainer = await driver.findElement(By.xpath(departmentXPath));
        let deptLinks = await deptContainer.findElements(By.css('a'));
        const numDeptLinks = deptLinks.length;
        driver.sleep(8000);
        console.log(numDeptLinks)
        const departments = [];
        //go through each department
        for(let j=0; j<numDeptLinks; j++){
            // update so links dont become stale
            deptContainer = await driver.findElement(By.xpath(departmentXPath));
            deptLinks = await deptContainer.findElements(By.css('a'));
    
            const currLinkD = deptLinks[j];
            const deptName = await currLinkD.getText();
           // console.log(`Department ${j + 1}: ${deptName}`);
    
        }

        await currLinkS.click();
    }


}

getClasses();

