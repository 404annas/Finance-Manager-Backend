import PaymentsDone from "../models/paymentsDoneModel.js";

export const addPaymentDone = async (req, res) => {
    const { title, receiver, amount, message } = req.body;
    if (!title || !receiver || !amount) {
        return res.status(400).json({ message: "Title, Receiver and Amount are required" });
    }
    try {
        const newPayment = await PaymentsDone.create({ userId: req.user._id, title, receiver, amount, message });
        console.log(req.user._id);
        res.status(201).json({ message: "Payment added successfully", payment: newPayment });
    } catch (error) {
        res.status(500).json({ error: "Failed to add payment" });
    }
}

export const getAllPaymentsDone = async (req, res) => {
    try {
        const payments = await PaymentsDone.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ payments });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch payments" });
    }
}

export const deletePayment = async (req, res) => {
    try {
        const deleted = await PaymentsDone.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!deleted) {
            return res.status(404).json({ message: "Payment not found or not authorized" });
        }

        res.status(200).json({ message: "Payment deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete payment" });
    }
};

export const deleteAllPayments = async (req, res) => {
    try {
        await PaymentsDone.deleteMany({ userId: req.user._id });
        res.status(200).json({ message: "All payments deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete all payments" });
    }
};