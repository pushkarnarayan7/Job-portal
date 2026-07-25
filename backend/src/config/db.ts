import dns from "dns";
import mongoose from "mongoose";

/**
 * mongodb+srv:// requires a DNS SRV lookup. On some Windows setups Node is given
 * only 127.0.0.1 as a resolver (e.g. a dead local DNS proxy), which yields
 * querySrv ECONNREFUSED even though the Atlas cluster is fine.
 */
const ensureWorkingDns = (): void => {
  const servers = dns.getServers();
  const onlyLoopback =
    servers.length > 0 &&
    servers.every(
      (s) => s === "127.0.0.1" || s === "::1" || s.startsWith("127.0.0.1:")
    );

  if (onlyLoopback) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
};

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    ensureWorkingDns();
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
