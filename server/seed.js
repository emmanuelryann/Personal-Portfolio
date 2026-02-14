import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Portfolio from './models/Portfolio.js';

dotenv.config({ path: './server/.env' });

const seedDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    const dataPath = path.resolve('server', 'data.json');
    if (!fs.existsSync(dataPath)) {
      console.log('⚠️ data.json not found, skipping sync.');
      process.exit(0);
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Check if portfolio already exists
    const existing = await Portfolio.findOne();
    if (existing) {
      console.log('ℹ️ Database already contains data. Skipping initial seed.');
      process.exit(0);
    }

    // Adapt data structure to match schema if necessary
    // Currently, our data.json matches 'content' and 'submissions'
    const newPortfolio = new Portfolio({
      content: data.content || {},
      submissions: data.submissions || [],
      adminSettings: {
        password: '$2a$10$YourDefaultHashHere', // User will need to reset or we can copy from auth logic
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: 'system-seed'
      }
    });

    await newPortfolio.save();
    console.log('✅ Database successfully seeded from data.json!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
