const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;
let gfs;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('bookstore');
        gfs = new GridFSBucket(db, {
            bucketName: 'images'
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

function getDB() {
    return db;
}

function getGFS() {
    return gfs;
}

module.exports = {
    connectDB,
    getDB,
    getGFS
}; 