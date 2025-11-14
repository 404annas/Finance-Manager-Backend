import rateLimit from "express-rate-limit";

// Public routes (basic pages)
export const publicLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 200,
    message: "Too many requests, please slow down."
});

// Authentication routes (login/signup/etc.)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts, try again later."
});

// Transaction/payment/sensitive routes
export const transactionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: "Too many payment operations, slow down."
});

// General API routes
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, wait a moment."
});
