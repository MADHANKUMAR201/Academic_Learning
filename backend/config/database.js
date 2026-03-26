import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // In development, don't exit the process so nodemon stays running
    // This helps you fix DNS/credentials without the app crashing repeatedly.
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1);
    }
    return null;
  }
};
