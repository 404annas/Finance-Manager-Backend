import User from "../models/userModel.js";

const viewUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findById(loggedInUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const connectedUserIds = user.invitedUsers;

        const totalConnected = connectedUserIds.length;
        const paginatedUserIds = connectedUserIds.slice(skip, skip + limit);

        const populatedUsers = await User.find({
            '_id': { $in: paginatedUserIds }
        }).select('name email profileImage status');

        const invitedBy = await User.findById(user.invitedBy).select('name email profileImage status');

        res.status(200).json({
            message: "User relationships fetched successfully",
            users: {
                invitedUsers: populatedUsers,
                invitedBy: invitedBy
            },
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalConnected / limit),
                totalUsers: totalConnected
            }
        });

    } catch (error) {
        console.error("❌ CRITICAL ERROR in viewUsers:", error);
        res.status(500).json({ message: "Can't Fetch Users", error: error.message });
    }
}

export default viewUsers;