const mongoose = require('mongoose');
const config = require('../config/env');

async function truncateDatabase() {
  try {
    const mongoUri = config.mongoUri || config.mongodbUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/archvizon';
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);

    let totalDeleted = 0;
    for (const collInfo of collections) {
      const collName = collInfo.name;
      if (collName.startsWith('system.')) continue;

      const coll = mongoose.connection.db.collection(collName);
      const count = await coll.countDocuments();
      await coll.deleteMany({});
      console.log(` - Truncated "${collName}": deleted ${count} document(s).`);
      totalDeleted += count;
    }

    console.log(`\nDatabase truncated successfully! Cleared ${totalDeleted} total document(s) across ${collections.length} collection(s).`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Truncation failed:', err.message);
    process.exit(1);
  }
}

truncateDatabase();
