import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "user_uploads",
        allowed_formats: ["jpg", "png", "jpeg", "avif", "svg"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
    },
});

const upload = multer({ storage });

export default upload;
