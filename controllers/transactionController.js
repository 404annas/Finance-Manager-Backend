import Transaction from "../models/transactionModel.js";

// Create a transaction
export const createTransaction = async (req, res) => {
    try {
        const { title, amount, category, currency, type, date, description, imageUrl } = req.body;

        if (!title || !amount || !category || !type) {
            res.status(400);
            throw new Error("Missing required transaction fields.");
        }

        const transaction = await Transaction.create({
            userId: req.user._id,
            title,
            amount,
            category,
            currency,
            type,
            date,
            description,
            imageUrl: imageUrl || null,
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update transactions for current user
export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const updateData = req.body;

        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: id, userId: req.user._id }, // Find criteria
            { $set: updateData }, // Atomically set the new data
            { new: true, runValidators: true } // Options: return the updated doc
        );

        if (!updatedTransaction) {
            res.status(404);
            throw new Error("Transaction not found or you're not authorized to edit it.");
        }

        res.status(200).json(updatedTransaction);

    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

// Get all transactions for current user
export const getUserTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'date',
            order = 'desc',
            category,
            dateFrom,
            dateTo
        } = req.query;

        // Convert page and limit to numbers
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Calculate the number of documents to skip
        const skip = (pageNum - 1) * limitNum;

        // Base query to only get transactions for the logged-in user
        const query = { userId: req.user._id };

        if (category && category !== 'All') {
            query.category = category;
        }

        if (dateFrom && dateTo) {
            query.date = { $gte: new Date(dateFrom), $lte: new Date(dateTo) };
        } else if (dateFrom) {
            query.date = { $gte: new Date(dateFrom) };
        } else if (dateTo) {
            query.date = { $lte: new Date(dateTo) };
        }

        // Get the total count of documents that match the query for the frontend
        const totalTransactions = await Transaction.countDocuments(query);

        // Fetch the paginated and sorted transactions from the database
        const transactions = await Transaction.find(query)
            .sort({ [sort]: order === 'asc' ? 1 : -1 }) // Apply sorting
            .skip(skip)                                 // Skip documents
            .limit(limitNum)                            // Limit results per page
            .lean();

        // Send response with transactions and pagination metadata
        res.status(200).json({
            transactions,
            currentPage: pageNum,
            totalPages: Math.ceil(totalTransactions / limitNum),
            totalTransactions,
        });
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
