import Mongodb from 'mongodb';
import dotenv from 'dotenv';

const MongoClient = Mongodb.MongoClient;
dotenv.config();
let db;

const dbUtils = {
  connectToServer: (callback) => {
    MongoClient.connect(
      process.env.MONGODB,
      { useNewUrlParser: true },
      (err, client) => {
        db = client.db('RankIQ');
        return callback(err);
      }
    );
  },

  getDb: () => {
    return db;
  },
};

export default dbUtils;
