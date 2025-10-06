import User from "../models/userModel.js";

const viewUsers = async (req, res) => {
    try {
        const loggedInUser = req.user;

        // Query 1: Find all users that the logged-in user has invited.
        const invitedUsers = await User.find({ invitedBy: loggedInUser._id }).select("name email profileImage status");

        // Query 2: Find the single user who invited the logged-in user, if they exist.
        let invitedBy = null;
        if (loggedInUser.invitedBy) {
            // Find the inviter's full details.
            invitedBy = await User.findById(loggedInUser.invitedBy).select("name email profileImage status");
        }

        // Return a structured object with both sets of data.
        res.status(200).json({
            message: "User relationships fetched successfully",
            users: {
                invitedUsers,
                invitedBy
            }
        });

    } catch (error) {
        console.error("Error in viewUsers controller:", error);
        res.status(500).json({ message: "Can't Fetch Users", error: error.message });
    }
}

export default viewUsers;