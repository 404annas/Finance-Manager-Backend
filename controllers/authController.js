import User from "../models/userModal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        let imageUrl = req.file ? req.file.path : undefined;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
        });

        await newUser.save();
        console.log("Body", req.body);
        console.log("File", req.file);

        // Generate JWT after successful registration
        const token = generateToken(newUser._id);

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email, image: newUser.image }
        });
    } catch (err) {
        console.error("Error saving user:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email, image: user.image }
        });
        console.log(req.body);

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const logoutUser = async (req, res) => {
    res.clearCookie("token"); // removes the JWT cookie
    res.status(200).json({ message: "Logout successful." });
};
