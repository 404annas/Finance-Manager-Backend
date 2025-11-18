import cloudinary from "../config/cloudinary.js"

export const getPictureUploadSignature = (req, res) => {
    try {
        // Get the current timestamp in seconds.
        const timestamp = Math.round((new Date()).getTime() / 1000);

        // Use the Cloudinary SDK utility to generate a secure signature.
        // This proves to Cloudinary that the upload request is coming from an authorized source.
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: "user_uploads",
        }, process.env.CLOUDINARY_API_SECRET);

        // Send the signature, timestamp, and API key back to the frontend.
        res.status(200).json({
            signature,
            timestamp,
            api_key: process.env.CLOUDINARY_API_KEY,
        })

    } catch (error) {
        console.error("Error generating upload signature:", error);
        res.status(500).json({ message: "Server Error: Could not generate upload signature." });
    }
}