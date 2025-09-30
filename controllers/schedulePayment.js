import SchedulePayment from "../models/schedulePaymentModel.js";

export const schedulePayment = async (req, res) => {
    const { title, message, scheduledDate } = req.body;
    if (!title, !message, !scheduledDate) return res.status(400).json({ message: "Title, Message, Date are required" })

    try {
        const newSchedule = await SchedulePayment.create({ userId: req.user._id, title, message, scheduledDate });
        res.status(201).json({ message: "Payment scheduled successfully", schedule: newSchedule });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to schedule payment" });
    };
}

export const getSchedules = async (req, res) => {
    try {
        const schedules = await SchedulePayment.find({ userId: req.user._id }).sort({ scheduledDate: 1 });
        res.status(200).json({ schedules });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch schedules" });
    }
}

export const deleteSchedule = async (req, res) => {
    try {
        const schedule = await SchedulePayment.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }
        if (schedule.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        await SchedulePayment.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete schedule" });
    }
};

export const deleteAllSchedules = async (req, res) => {
    try {
        await SchedulePayment.deleteMany({ userId: req.user._id });
        res.status(200).json({ message: "All schedules deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete all schedules" });
    }
};