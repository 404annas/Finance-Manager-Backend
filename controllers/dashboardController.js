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

        // --- THE FIX: Use .populate() to get the full user objects ---
        const user = await User.find({ invitedBy: userId }).select("name status");
        // `user.invitedUsers` is now an array of objects: [{_id, name, email}, ...]
        const connectedUsers = user.filter(user => user.status === 'accepted');

        const upcomingSchedules = await SchedulePayment.countDocuments({ scheduledFor: userId, status: "pending" });

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
            connectedUsers, // This is now an array of objects
            upcomingSchedules, // Added this stat back in
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