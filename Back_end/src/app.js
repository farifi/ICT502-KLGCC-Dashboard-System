const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const authRoutes = require("./auth");
const staffRoutes = require("./staffRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const carRoutes = require("./carRoutes");
const customerRoutes = require("./customerRoutes");
const teeTimeRoutes = require("./teeTimeRoutes");
const serviceRoutes = require("./serviceRoutes");
const paymentRoutes = require("./paymentRoutes");
const rentalRoutes = require("./rentalRoutes"); // ← fixed: was RentalRoutes

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/car", carRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/teetime", teeTimeRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/rental", rentalRoutes); // ← now matches

module.exports = app;