# 💻 FINANCE-APP-BACKEND

**FINANCE-APP-BACKEND** is the secure, reliable, and feature-rich backend service powering the FINANCE-APP frontend dashboard and upcoming mobile app.  
It handles authentication, payment scheduling, transactions, email reminders, file uploads, and user management with a modular and maintainable architecture.

---

## ✨ About the Project

This backend is built using **Node.js and Express** and follows the **MVC (Model-View-Controller)** pattern for clean separation of concerns.  
It acts as the central API for the FINANCE-APP, managing all server-side business logic, database interactions, secure communication, and integration with external services.

Key functionalities include:  
- **User Authentication & Authorization** using JWT and middleware (`authMiddleware.js`)  
- **Payment & Transaction Management** including scheduling, categorization, and reminders (`transactionController.js`, `schedulePayment.js`)  
- **Automated Email Notifications** using Nodemailer (`reminderMailer.js`, `inviteUser.js`)  
- **File Upload Handling** via Multer & Cloudinary for images (`cloudinary.js`, `multer.js`)  
- **Scheduled Tasks** with Node-Cron for recurring reminders (`cron.js`)  
- **Secure & Scalable Architecture** with Helmet, CORS, and dotenv for environment configuration  

This backend ensures all operations are **secure, fast, and consistent** with the frontend dashboard and future mobile applications.

---

## 🚀 Key Features

* **🔐 Secure Authentication & Authorization**  
  - JWT-based authentication to protect routes.  
  - Role-Based Access Control for admin and regular users.  
  - Passwords securely hashed with **bcryptjs**.  

* **👤 User Management**  
  - CRUD operations for users (`userController.js`, `deleteUsers.js`).  
  - Invite users to collaborate on payments or dashboards.  
  - Admin dashboard support for full user oversight.

* **💳 Payments & Transactions**  
  - Add, track, schedule, and categorize payments.  
  - Real-time tracking via APIs for the frontend dashboard.  
  - Users can create shared transactions with multiple contributors.

* **📧 Email Services**  
  - Send reminders, notifications, and invitations via **Nodemailer**.  
  - Scheduled email sending using **node-cron**.  
  - Template-based emails for clarity and professional appearance.

* **🖼️ Cloud-Based File Handling**  
  - File uploads for attachments/images handled via **Multer** and **Cloudinary**.  
  - Secure storage, optimized image delivery, and organized folders.  
  - Supports dynamic image and media content for transactions and user profiles.

* **🕒 Scheduled Tasks & Reminders**  
  - Cron jobs automate sending payment reminders and notifications.  
  - Ensures users and collaborators are alerted in a timely manner.

* **🔀 RESTful API Design**  
  - Well-structured endpoints for all frontend interactions.  
  - Consistent and modular route grouping (users, payments, transactions, reminders, shares).  
  - Middleware ensures secure, authenticated access.

---

## 🛠️ Technologies & Libraries Used

### Core Stack
- **Node.js:** Fast and scalable server-side runtime.  
- **Express.js:** Minimalist and flexible backend framework.  
- **MongoDB:** NoSQL database for storing user, payment, and transaction data.  
- **Mongoose:** ODM for schema validation, relationships, and database operations.

### Security & Middleware
- **bcryptjs:** Hashing passwords for secure storage.  
- **jsonwebtoken (JWT):** Secure token-based authentication.  
- **helmet:** Adds HTTP headers to enhance security.  
- **cors:** Cross-Origin Resource Sharing configuration.  
- **cookie-parser:** Parse cookies for session management.

### File Upload & Cloud Storage
- **multer & multer-storage-cloudinary:** Handles file uploads and stores in Cloudinary.  
- **cloudinary:** Cloud-based media storage with optimized delivery.

### Scheduling & Email
- **node-cron:** Schedule recurring jobs for reminders.  
- **nodemailer:** Send automated emails for reminders and invitations.

### Utilities
- **dotenv:** Manage environment variables securely.  
- **nodemon:** Dev dependency for live server reloading.

---

## 📂 Project Structure

```
FINANCE-APP-BACKEND/
|
├── config/              # Configuration files (DB, Cloudinary, Mailer)
│   ├── cloudinary.js
│   ├── cron.js
│   ├── db.js
│   ├── mailer.js
│   └── multer.js
├── controllers/         # Business logic for handling requests
├── middlewares/         # Middleware functions (e.g., authentication)
├── models/              # Mongoose schemas for MongoDB
├── routes/              # API route definitions
├── uploads/             # Directory for temporary file uploads
|
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── app.js               # Main application entry point and Express server setup
└── package.json         # Project dependencies and scripts
```

---

## 🖥️ Backend Flow (Integration with Frontend)

1. **User Authentication** → Client logs in/registers → Backend verifies credentials → Returns JWT token.  
2. **Dashboard Data Fetch** → Frontend requests user dashboard → Backend sends real-time payments, transactions, and chart data from MongoDB.  
3. **Payments & Transactions** → Users create or update payments → Backend saves to database → Sends confirmation & updates shared users.  
4. **Email Notifications** → Scheduled or triggered emails (reminders, invites) sent via Nodemailer & cron jobs.  
5. **File Uploads** → Users upload images → Multer temporarily stores → Cloudinary uploads → Returns URL to frontend.  
6. **Shared/Collaborative Payments** → Backend manages invited users, recipients, and shared transactions → Sends real-time updates to collaborators.  
7. **Admin Controls** → Admin API routes allow managing users, monitoring transactions, and overseeing the platform.

---

## 📬 Contact

For any queries, suggestions, or issues regarding the backend, reach out:  

📧 **Email**: annasking601@gmail.com  
🌐 **Project Link**: [FINANCE-APP](https://finance-manage-kappa.vercel.app/)