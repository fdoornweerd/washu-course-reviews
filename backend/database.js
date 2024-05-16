const { MongoClient } = require('mongodb');

class DB {
    constructor() {
        this.client = null;
        this.db = null;
    }

    async connect(uri) {
        if (this.db) {
            return this.db;
        }
        
        try {
            this.client = await MongoClient.connect(uri);
            this.db = this.client.db('RateMyCourse');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }

        return this.db;
    }

    async close() {
        if (this.client) {
            await this.client.close();
        }
    }

    getDB() {
        if (!this.db) {
            throw new Error("No database connected!");
        }
        return this.db;
    }
}

module.exports = new DB();
