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
        console.log("Token", decoded)
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        req.user = user;
        console.log("Auth Middleware", user);
        next();
    } catch (err) {
        res.status(401).json({ message: "Not authorized", error: err.message });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
};

export const isUser = (req, res, next) => {
    if (req.user.role !== "user") {
        return res.status(403).json({ message: "Access denied. User only." });
    }
    next();
};
