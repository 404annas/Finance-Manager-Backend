import Invite from "../models/inviteModel.js";
import User from "../models/userModel.js";

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete user
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete invites sent by this user (where they are the inviter)
        const deletedInvites = await Invite.deleteMany({ invitedBy: deletedUser._id });

        res.status(200).json({
            message: "User and related invites deleted successfully",
            user: deletedUser,
            invitesDeleted: deletedInvites.deletedCount,
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            message: "Error deleting user",
            error: error.message,
        });
    }
};

export default deleteUser;
