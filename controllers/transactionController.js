import Transaction from "../models/transactionModel.js";

// Create a transaction
export const createTransaction = async (req, res) => {
    try {
        const { title, amount, category, currency, type } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = req.file.path; // multer + cloudinary
        }

        const transaction = await Transaction.create({
            userId: req.user._id,
            title,
            amount,
            category,
            currency,
            type,
            imageUrl,
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get all transactions for current user
export const getUserTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findOne({ _id: id, userId: req.user._id });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        await Transaction.deleteOne({ _id: id });
        res.status(200).json({ message: "Transaction deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete all transactions for current user
export const deleteAllTransactions = async (req, res) => {
    try {
        await Transaction.deleteMany({ userId: req.user._id });
        res.status(200).json({ message: "All transactions deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
