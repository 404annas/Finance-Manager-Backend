import User from "../models/userModel.js";

const viewUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const invitedUsers = await User.find({ invitedBy: loggedInUserId });

        res.status(200).json({
            message: "Users invited by you have been fetched successfully",
            users: invitedUsers
        });

    } catch (error) {
        console.error("Error in viewUsers controller:", error);
        res.status(500).json({ message: "Can't Fetch Users", error: error.message });
    }
}
export default viewUsers;
