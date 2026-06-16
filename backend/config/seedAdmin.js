import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

async function seedAdmin() {
  const requiredEnv = ['MONGO_URI', 'ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_PHONE'];
  for (const envVar of requiredEnv) {
    if (!process.env[envVar]) {
      console.error(`${envVar} is missing in environment variables`);
      process.exit(1);
    }
  }

  const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE } = process.env;

  try {
    await mongoose.connect(MONGO_URI);

    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
    const existingAdmin = await User.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      console.log('Admin already exists');
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: normalizedEmail,
        password: ADMIN_PASSWORD,
        phoneNumber: ADMIN_PHONE,
        role: 'admin',
        isVerified: true,
        isHospitalVerified: true,
      });
      console.log('Admin account created successfully');
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
