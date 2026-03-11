import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.warn("⚠ MONGODB_URI not set - running without database");
      return null;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠ MongoDB Connection Failed: ${error.message}`);
    console.warn("⚠ Running without database - using mock data");
    return null;
  }
};
