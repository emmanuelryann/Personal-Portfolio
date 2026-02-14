import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  content: {
    bio: {
      title: String,
      subtitle: String,
      description1: String,
      description2: String,
      image: String,
      yearsExperience: String,
      projectsCompleted: String
    },
    skills: [{
      name: String,
      icon: String
    }],
    portfolio: [{
      id: String,
      title: String,
      category: String,
      image: String,
      link: String,
      description: String
    }],
    services: [{
      id: String,
      title: String,
      icon: String,
      description: String
    }],
    experience: [{
      id: String,
      role: String,
      company: String,
      duration: String,
      location: String,
      description: String
    }],
    education: [{
      id: String,
      degree: String,
      school: String,
      duration: String,
      location: String,
      description: String
    }],
    testimonials: [{
      id: String,
      name: String,
      role: String,
      content: String,
      avatar: String
    }],
    contactInfo: {
      email: String,
      phone: String,
      location: String,
      social: {
        github: String,
        linkedin: String,
        twitter: String,
        instagram: String
      }
    }
  },
  submissions: [{
    id: String,
    firstName: String,
    lastName: String,
    email: String,
    subject: String,
    message: String,
    date: Date
  }],
  adminSettings: {
    password: { type: String, required: true },
    lastUpdated: String,
    lastUpdatedBy: String
  }
}, { timestamps: true });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
