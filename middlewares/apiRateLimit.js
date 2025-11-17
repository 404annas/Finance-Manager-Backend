import rateLimit from "express-rate-limit";

// For general public routes (like your root "/")
export const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: "Too many requests, please try again later."
});

// For authenticated GET requests (reading data)
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many requests, please try again later."
});

// For authenticated POST/PUT/DELETE requests (writing/modifying data)
export const transactionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 75,
    message: "Too many data modification requests, please try again later."
});

// For authentication attempts (login, register, forgot password)
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: "Too many authentication attempts, please try again after an hour."
});

// For public routes that send emails, to prevent spamming. VERY STRICT.
export const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Only 5 emails per hour from one IP
    message: "Too many emails sent from this IP, please try again after an hour."
});