import SchedulePayment from "../models/schedulePaymentModel.js";

export const addSchedule = async (req, res) => {
    try {
        // The frontend will now send `scheduledDate` as a string
        const { title, message, scheduledDate, scheduledForIds } = req.body;
        const createdBy = req.user._id;

        if (!title || !scheduledDate || !scheduledForIds || !Array.isArray(scheduledForIds) || scheduledForIds.length === 0) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const schedulePromises = scheduledForIds.map(userId => {
            return SchedulePayment.create({
                createdBy,
                scheduledFor: userId,
                title,
                message,
                scheduledDate: new Date(scheduledDate),
            });
        });

        await Promise.all(schedulePromises);
        res.status(201).json({ message: "Payment(s) scheduled successfully." });

    } catch (error) {
        console.error("Error scheduling payment:", error);
        res.status(500).json({ message: "Server error." });
    }
};

export const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message, scheduledDate } = req.body;

        const schedule = await SchedulePayment.findOne({ _id: id, createdBy: req.user._id });

        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found or you're not authorized to edit it." });
        }

        schedule.title = title || schedule.title;
        schedule.message = message || "";
        schedule.scheduledDate = scheduledDate ? new Date(scheduledDate) : schedule.scheduledDate;

        schedule.status = 'pending';

        await schedule.save();
        res.status(200).json({ message: "Schedule updated successfully." });

    } catch (error) {
        console.error("Error updating schedule:", error);
        res.status(500).json({ message: "Server error while updating schedule." });
    }
};

export const getSchedules = async (req, res) => {
    try {
        // 1. Get pagination and sorting options from query params
        const {
            page = 1,
            limit = 10,
            sort = 'scheduledDate',
            order = 'asc' // Default to ascending to show upcoming payments first
        } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // 2. Define the base query to find schedules for the current user
        const query = {
            $or: [{ createdBy: req.user._id }, { scheduledFor: req.user._id }]
        };

        // 3. Get the total count of documents that match the query
        const totalSchedules = await SchedulePayment.countDocuments(query);

        // 4. Fetch the paginated and sorted data from the database
        const schedules = await SchedulePayment.find(query)
            .populate('createdBy', 'name')
            .populate('scheduledFor', 'name')
            .sort({ [sort]: order === 'asc' ? 1 : -1 }) // Apply sorting
            .skip(skip)                                 // Skip documents for previous pages
            .limit(limitNum)                            // Limit results for the current page
            .lean();

        // 5. Send the paginated response
        res.status(200).json({
            schedules,
            currentPage: pageNum,
            totalPages: Math.ceil(totalSchedules / limitNum),
            totalSchedules,
        });
        
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