import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkRawUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ name: /keerthivasan/i });
    if (!user) {
      console.log('User not found');
      return;
    }
    console.log('Raw User Data:', JSON.stringify(user, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRawUser();
