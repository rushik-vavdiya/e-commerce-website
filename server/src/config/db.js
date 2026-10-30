import mongoose from "mongoose";
import env from "./env.js";
import UserOTP from "../modules/user/user.otp.model.js";

const removeObsoleteOtpTtlIndex = async () => {
  const database = mongoose.connection.db;
  const collectionName = UserOTP.collection.collectionName;
  const collectionExists = await database
    .listCollections({ name: collectionName }, { nameOnly: true })
    .hasNext();

  if (!collectionExists) return;

  const indexes = await UserOTP.collection.indexes();
  const obsoleteIndex = indexes.find(
    (index) => index.name === "resetExpiresAt_1" && typeof index.expireAfterSeconds === "number",
  );

  if (obsoleteIndex) {
    await UserOTP.collection.dropIndex(obsoleteIndex.name);
    console.warn(
      "Removed obsolete resetExpiresAt TTL index; it could delete email-verification codes.",
    );
  }
};

const connectDB = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is not configured");
  }

  try {
    await mongoose.connect(env.mongoUri);

    await removeObsoleteOtpTtlIndex();
    console.log("MongoDB connected successfully");
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

export default connectDB;
