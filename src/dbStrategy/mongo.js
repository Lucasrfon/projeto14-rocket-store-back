import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db = null;
mongoClient.connect(() => {
    console.log('DataBase online');
    db = mongoClient.db(process.env.DB_NAME);
});

export { db, ObjectId };