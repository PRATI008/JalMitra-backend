const mongoose = require('mongoose');
const models = require('../models/Collections');

const COLLECTION_MAP = [
  { key: 'suppliers', model: models.Supplier },
  { key: 'registeredSuppliers', model: models.RegisteredSupplier },
  { key: 'users', model: models.User },
  { key: 'orders', model: models.Order },
  { key: 'products', model: models.Product },
  { key: 'reviews', model: models.Review },
  { key: 'notifications', model: models.Notification },
  { key: 'supplierNotifications', model: models.SupplierNotification },
  { key: 'subscriptions', model: models.Subscription },
];

let isConnected = false;

async function connectMongo(seedData) {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('<username>') || uri.trim() === '') {
    console.log('⚠️  MONGO_URI not configured in .env — running with local db.json fallback');
    return { connected: false, data: null };
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully!');

    const loadedData = {};

    for (const { key, model } of COLLECTION_MAP) {
      const docs = await model.find({}).lean();
      if (docs.length === 0 && Array.isArray(seedData[key]) && seedData[key].length > 0) {
        const cleanSeed = seedData[key].map(({ _id, ...rest }) => rest);
        await model.insertMany(cleanSeed);
        loadedData[key] = cleanSeed;
        console.log(`🌱 Seeded ${cleanSeed.length} docs into MongoDB [${key}]`);
      } else {
        loadedData[key] = docs.map(({ _id, createdAt, updatedAt, ...rest }) => rest);
      }
    }

    return { connected: true, data: loadedData };
  } catch (err) {
    console.error('❌ MongoDB Atlas connection failed:', err.message);
    console.log('⚠️  Falling back to local db.json');
    isConnected = false;
    return { connected: false, data: null };
  }
}

async function syncToMongo(data) {
  if (!isConnected || mongoose.connection.readyState !== 1) return false;

  try {
    await Promise.all(
      COLLECTION_MAP.map(async ({ key, model }) => {
        if (!Array.isArray(data[key])) return;
        const cleanDocs = data[key].map(({ _id, createdAt, updatedAt, ...rest }) => rest);
        await model.deleteMany({});
        if (cleanDocs.length > 0) {
          await model.insertMany(cleanDocs);
        }
      })
    );
    return true;
  } catch (err) {
    console.error('❌ MongoDB Atlas sync error:', err.message);
    return false;
  }
}

function getMongoStatus() {
  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    host: mongoose.connection?.host || null,
    name: mongoose.connection?.name || null,
  };
}

module.exports = {
  connectMongo,
  syncToMongo,
  getMongoStatus,
};

