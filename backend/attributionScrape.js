const { Builder, By, Key, until } = require("selenium-webdriver");
const { MongoClient } = require("mongodb");
require('dotenv').config();


const ATTRIBUTE_SCHOOLS_ALLOWED = ['A&S IQ','Arch','Art','BU','EN'];

async function getAttributions(){
    const driver = await new Builder().forBrowser('chrome').build();

    await driver.get('https://courses.wustl.edu/Semester/Search.aspx');


    const attributions = [];

    const attributionElements = await driver.findElements(By.xpath('/html/body/form/div[5]/table[2]/tbody/tr[1]/td[1]/table/tbody/tr[3]/td[2]/select/option'));

    for(const element of attributionElements){
        
        const text = await element.getText();
        if(text == 'Any Attribute'){
            continue;
        }

        const type = text.match(/\((.*)\)/)[1];
        const name = text.split(')')[1].trim().split('-')[0].trim();


        if(!ATTRIBUTE_SCHOOLS_ALLOWED.includes(type)){
            continue;
        }

        if(type == 'A&S IQ'){
            attributions.push(['A&S',name]);
        } else{
            attributions.push([type,name]);
        }

        


        
    }

    return attributions;

}


async function run(){
    const uri = "mongodb+srv://fdoornweerd:"+process.env.MONGODB_PASSWORD+"@cluster0.glst1ub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = client.db('RateMyCourse');
    const attr = database.collection('attributions');

    


    const attributes = await getAttributions();

    for(let i=0; i<attributes.length; i++){
        const existingAttr = await attr.findOne({ school: attributes[i][0], attribute: attributes[i][1] });

        if(!existingAttr){
            const result = await attr.insertOne({school: attributes[i][0], attribute: attributes[i][1]});
            console.log(`Inserted Attribution: ${attributes[i][1]} - ${attributes[i][0]}`);
        }
    }



    await client.close();

}

run();

