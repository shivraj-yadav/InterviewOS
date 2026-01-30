import dotenv from "dotenv";

dotenv.config({quiet: true}); // 🔥 must run immediately

export const ENV = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI
};
