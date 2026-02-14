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

    // Migrate password hash if it exists, otherwise use a placeholder
    const passwordHash = data.admin?.passwordHash || '$2b$10$PlaceholderHashIfMissing';

    // Adapt data structure to match schema exactly
    const portfolioData = {
      content: data.content || {},
      submissions: data.submissions || [],
      adminSettings: {
        password: passwordHash,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        lastUpdatedBy: data.lastUpdatedBy || 'system-seed'
      }
    };

    // Check if portfolio already exists
    const existing = await Portfolio.findOne();
    if (existing) {
      console.log('ℹ️ Database already contains data. Overwriting with local data.json...');
      await Portfolio.deleteOne({});
    }

    const newPortfolio = new Portfolio(portfolioData);
    await newPortfolio.save();
    console.log('✅ Database successfully seeded and password hash migrated!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
