import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  content: {
    bio: mongoose.Schema.Types.Mixed,
    skills: [mongoose.Schema.Types.Mixed],
    portfolio: [mongoose.Schema.Types.Mixed],
    services: [mongoose.Schema.Types.Mixed],
    experience: [mongoose.Schema.Types.Mixed],
    education: [mongoose.Schema.Types.Mixed],
    testimonials: [mongoose.Schema.Types.Mixed],
    contactInfo: mongoose.Schema.Types.Mixed
  },
  submissions: [mongoose.Schema.Types.Mixed],
  adminSettings: {
    password: { type: String, required: true },
    lastUpdated: String,
    lastUpdatedBy: String
  }
}, { timestamps: true, strict: false });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
