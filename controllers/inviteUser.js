import Invite from "../models/inviteModel.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { sendInviteEmail } from "../config/mailer.js"; // This function will now expect (to, fullInviteLink)

export const inviteUser = async (req, res) => {
    try {
        const { email } = req.body;
        // 1. Check if already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Generate RAW JWT Token
        const rawJwtToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        console.log("Generated RAW JWT Token (in inviteUser):", rawJwtToken);

        // 3. Save invite (store the RAW JWT token in the database)
        await Invite.create({
            email,
            token: rawJwtToken, // Store the raw JWT string here
        });
        console.log("Invite created in DB with invitedBy:", req.user?._id || "null (no admin ID)");

        // 4. Construct the FULL invite URL
        const fullInviteLink = `http://localhost:5174/register?token=${rawJwtToken}`;
        console.log("Full invite link to be sent (in inviteUser):", fullInviteLink);

        // 5. Send email - Pass the FULL invite URL to the mailer function
        await sendInviteEmail(email, fullInviteLink); // <--- PASS THE FULL URL HERE

        res.json({ message: "✅ Invite sent successfully!" });
    } catch (error) {
        console.error("❌ Invite error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};