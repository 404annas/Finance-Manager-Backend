import mongoose from "mongoose";

const connectToDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
    } catch (err) {
        console.error("❌ DB Connection Failed:", err.message);
        process.exit(1);
    }
}

export default connectToDB;