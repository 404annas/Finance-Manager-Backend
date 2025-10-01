import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authMiddleware = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "Not authorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded); // 👈 check karo kya aa raha hai
        const user = await User.findById(decoded.id).select("-password");
        console.log("User from middleware:", user); // 👈 ye bhi check
        if (!user) return res.status(404).json({ message: "User not found" });

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: "Not authorized", error: err.message });
    }
};
