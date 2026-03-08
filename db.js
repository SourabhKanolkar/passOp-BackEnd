import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI;

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB Atlas Connected ✅");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectToMongo;