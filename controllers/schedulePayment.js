import SchedulePayment from "../models/schedulePaymentModel.js";
import moment from "moment-timezone";

export const addSchedule = async (req, res) => {
    try {
        // The frontend will now send `scheduledDate` as a string
        const { title, message, scheduledDate, scheduledForIds } = req.body;
        const createdBy = req.user._id;

        if (!title || !scheduledDate || !scheduledForIds || !Array.isArray(scheduledForIds) || scheduledForIds.length === 0) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // 2. THE FIX: Interpret the incoming date string in the context of your target timezone.
        // This tells moment, "Take this string, and treat it as if it's 'Asia/Karachi' time."
        const scheduledMoment = moment.tz(scheduledDate, "Asia/Karachi");

        // 3. Convert the timezone-aware moment object back to a standard JS Date.
        // This object now correctly represents the UTC equivalent of the user's intended local time.
        const scheduledDateUTC = scheduledMoment.toDate();

        const schedulePromises = scheduledForIds.map(userId => {
            return SchedulePayment.create({
                createdBy,
                scheduledFor: userId,
                title,
                message,
                // 4. Save the corrected UTC date to the database.
                scheduledDate: scheduledDateUTC,
            });
        });

        await Promise.all(schedulePromises);
        res.status(201).json({ message: "Payment(s) scheduled successfully." });

    } catch (error) {
        console.error("Error scheduling payment:", error);
        res.status(500).json({ message: "Server error." });
    }
};

export const getSchedules = async (req, res) => {
    try {
        // Find schedules where the current user is either the creator OR the recipient
        const schedules = await SchedulePayment.find({
            $or: [{ createdBy: req.user._id }, { scheduledFor: req.user._id }]
        })
            .populate('createdBy', 'name') // Show who created it
            .populate('scheduledFor', 'name') // Show who it's for
            .sort({ scheduledDate: 1 });

        res.status(200).json({ schedules });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch schedules" });
    }
};

export const deleteSchedule = async (req, res) => {
    try {
        const schedule = await SchedulePayment.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }
        // SECURITY: Only the person who created the schedule can delete it
        if (schedule.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this schedule" });
        }
        await SchedulePayment.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete schedule" });
    }
};

export const deleteAllSchedules = async (req, res) => {
    try {
        // Delete all schedules created by the current user
        await SchedulePayment.deleteMany({ createdBy: req.user._id });
        res.status(200).json({ message: "All of your created schedules have been deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete all schedules" });
    }
};