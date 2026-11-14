const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const User = require('../models/User');
const { ROLES } = require('../constants/roles');

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB at:', config.mongodbUri);
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB successfully.');

    const defaultPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const demoUsers = [
      {
        name: 'Alex Administrator',
        email: 'admin@archvizon.com',
        role: ROLES.ADMIN,
        organization: 'Archvizon HQ'
      },
      {
        name: 'Sarah ProjectManager',
        email: 'pm@archvizon.com',
        role: ROLES.PROJECT_MANAGER,
        organization: 'Archvizon Production'
      },
      {
        name: 'David 3DArtist',
        email: 'artist@archvizon.com',
        role: ROLES.VISUALIZATION_ARTIST,
        organization: 'Archvizon Studio'
      },
      {
        name: 'Michael Developer',
        email: 'client@developer.com',
        role: ROLES.CLIENT,
        organization: 'Skyline Urban Properties'
      }
    ];

    for (const u of demoUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        await User.create({
          ...u,
          passwordHash,
          accountStatus: 'ACTIVE'
        });
        console.log(`Created demo user: [${u.role}] ${u.email} (password: ${defaultPassword})`);
      } else {
        console.log(`User already exists: [${u.role}] ${u.email}`);
      }
    }

    console.log('\nDatabase seeding complete! You can log in with any of the accounts above.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seedDatabase();
