import Transaction from "../models/transactionModel.js";
import SchedulePayment from "../models/schedulePaymentModel.js";
import User from "../models/userModel.js";
import moment from "moment";

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();

        // --- Quick Stats (reused for charts) ---
        const monthlyTransactions = await Transaction.find({
            userId: userId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }).lean();

        const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const totalTransactions = monthlyTransactions.length;

        // --- Connected Users ---
        const currentUser = await User.findById(userId)
            .populate('invitedUsers', 'name email profileImage')
            .lean(); // Use .lean() for a plain JavaScript object

        const connectedUsers = currentUser ? currentUser.invitedUsers : [];

        // --- THE FIX IS HERE ---
        // Count all pending schedules where the user is either the creator OR the recipient.
        const upcomingSchedules = await SchedulePayment.countDocuments({
            status: "pending",
            $or: [{ createdBy: userId }, { scheduledFor: userId }]
        });

        // --- (Optional but Recommended) Get Recent Schedules for the list ---
        const recentSchedules = await SchedulePayment.find({
            status: "pending",
            $or: [{ createdBy: userId }, { scheduledFor: userId }]
        })
            .sort({ scheduledDate: 1 })
            .limit(5)
            .populate('scheduledFor', 'name')
            .populate('createdBy', 'name')
            .lean();


        // --- Chart Data Calculations ---
        const incomeByCategory = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
        const expenseByCategory = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
        const dailyUsage = monthlyTransactions.reduce((acc, t) => { const day = moment(t.createdAt).format('YYYY-MM-DD'); acc[day] = (acc[day] || 0) + 1; return acc; }, {});
        const recentTransactions = monthlyTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // --- Assemble the final response ---
        const stats = {
            totalIncome,
            totalExpenses,
            totalTransactions,
            connectedUsers,
            upcomingSchedules,
            recentSchedules, // Added for the list on the dashboard
            incomeByCategory: Object.entries(incomeByCategory).map(([key, value]) => ({ _id: key, totalAmount: value })),
            expenseByCategory: Object.entries(expenseByCategory).map(([key, value]) => ({ _id: key, totalAmount: value })),
            dailyUsage: Object.entries(dailyUsage).map(([key, value]) => ({ day: key, count: value })).sort((a, b) => new Date(a.day) - new Date(b.day)),
            recentTransactions,
        };

        res.status(200).json(stats);

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Server Error" });
    }
};