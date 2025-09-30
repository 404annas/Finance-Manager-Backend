import User from "../models/userModel.js";

const viewUsers = async (req, res) => {
    try {
        const invitedUsers = await User.find({ status: "accepted" })
        res.status(200).json({
            message: "Invited and Registered users fetched successfully",
            users: invitedUsers
        });

    } catch (error) {
        console.error("Error in viewUsers controller:", error);
        res.status(500).json({ message: "Can't Fetch Users", error: error.message });
    }
}

export default viewUsers;
