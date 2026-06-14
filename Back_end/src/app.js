const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const authRoutes = require("./auth");
const staffRoutes = require("./staffRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const bookingRoutes = require("./bookingRoutes");
const customerRoutes = require("./customerRoutes");
const teeTimeRoutes = require("./teeTimeRoutes");
const equipmentRoutes = require("./equipmentRoutes");
const courseRoutes = require("./courseRoutes");
const cartRoutes = require("./cartRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Session is still used for now, but JWT will be the primary auth mechanism.
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
app.use("/api/booking", bookingRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/teetime", teeTimeRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/cart", cartRoutes);

module.exports = app;
