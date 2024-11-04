// RUN ONCE A SEMESTER TO BACKUP ALL DATA
// Then go to MongoDB and delete old backup - it has timestamps so just delete the older database's name.
// The one without a timestamp is the production database SO DO NOT DELTE THAT ONE!!
// If something/someone messes up and the data is deleted you can use the data in the backup to restore the DB that is in production

const { MongoClient } = require('mongodb');
require('dotenv').config();

const now = new Date()
const formattedDate = now.getFullYear().toString() +"-"+ (now.getMonth() + 1).toString().padStart(2, '0') +"-"+ now.getDate().toString().padStart(2, '0');

const sourceDbName = 'RateMyCourse';
const destDbName = 'RateMyCourseBACKUP_'+formattedDate;

async function backupDatabase() {
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();

        const sourceDb = client.db(sourceDbName);
        const destDb = client.db(destDbName);

        
        const collections = await sourceDb.listCollections().toArray();

        for (const collection of collections) {
            const collectionName = collection.name;
            console.log(`Backing up collection: ${collectionName}`);

            const documents = await sourceDb.collection(collectionName).find({}).toArray();

            if (documents.length > 0) {
                // Insert documents into the destination collection
                await destDb.collection(collectionName+"_BACKUP").insertMany(documents);
                console.log(`Copied ${documents.length} documents to ${destDbName}.${collectionName}_BACKUP`);
            }
        }

        console.log("Backup completed successfully!");

    } catch (error) {
        console.error("Error during backup:", error);
    } finally {
        await client.close();
    }
}


backupDatabase().catch(console.error);
