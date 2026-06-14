const { getConnection } = require('../config/db.js');
const oracledb = require('oracledb');

exports.totalBookingsRevenue = async (req, res) => {
    let conn;
        try {
            conn = await getConnection();
    
            const totalBookingsRevenue = await conn.execute(
                `SELECT c.COURSE_NAME, SUM(b.TOTAL_PRICE) AS TOTAL_REVENUE
                FROM BOOKING b
                JOIN TEE_TIME t ON b.TEE_TIME_ID = t.TEE_TIME_ID
                JOIN COURSE c ON t.COURSE_ID = c.COURSE_ID
                GROUP BY c.COURSE_NAME
                ORDER BY TOTAL_REVENUE DESC`, [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
    
            if (totalBookingsRevenue.rows.length === 0 ){
                return res.status(200).json({ message: "No record currently in the database"});
            }
    
            res.status(201).json({ totalBookingsRevenue: totalBookingsRevenue.rows });

        } catch (err) {
            console.error('Signup error:', err);
            if (!res.headerSent) {
                res.status(500).json({ message: "Server error", error: err.message });
            }
        } finally {
            if (conn) {
                try {
                    await conn.close(); 
                } catch (err) {
                     console.error(err);
                }
            } 
        }
};

exports.bookingTrend = async (req, res) => {
    let conn;
    try {
            conn = await getConnection();
    
            const bookingTrend = await conn.execute(
                `SELECT b.BOOKING_DATE, COUNT(*) AS TOTAL_BOOKINGS
                FROM BOOKING b
                GROUP BY b.BOOKING_DATE
                ORDER BY b.BOOKING_DATE`, [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
    
            if (bookingTrend.rows.length === 0 ){
                return res.status(200).json({ message: "No record currently in the database"});
            }
    
            res.status(201).json({ bookingTrend: bookingTrend.rows }); 

        } catch (err) {
            console.error('Signup error:', err);
            if (!res.headerSent) {
                res.status(500).json({ message: "Server error", error: err.message });
            }
        } finally {
            if (conn) {
                try {
                    await conn.close(); 
                } catch (err) {
                     console.error(err);
                }
            } 
        }
};

exports.averageBookingPricePerStaff = async (req, res) => {
    let conn;
    try {
            conn = await getConnection();
            const averageBookingPricePerStaff = await conn.execute(
                `SELECT s.FULL_NAME AS STAFF_NAME, ROUND(AVG(b.TOTAL_PRICE), 2) AS AVG_BOOKING_PRICE
                FROM BOOKING b
                JOIN STAFF s ON b.STAFF_ID = s.STAFF_ID
                GROUP BY s.FULL_NAME
                ORDER BY AVG_BOOKING_PRICE DESC`, [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
    
            if (averageBookingPricePerStaff.rows.length === 0 ){
                return res.status(200).json({ message: "No record currently in the database"});
            }
    
            res.status(201).json({ averageBookingPricePerStaff: averageBookingPricePerStaff.rows });    

        } catch (err) {
            console.error('Signup error:', err);
            if (!res.headerSent) {
                res.status(500).json({ message: "Server error", error: err.message });
            }
        } finally {
            if (conn) {
                try {
                    await conn.close(); 
                } catch (err) {
                     console.error(err);
                }
            } 
        }
};

exports.bookingCountByCourse = async (req, res) => {
    let conn;
        try {
            conn = await getConnection();
    
            const bookingCountByCourse = await conn.execute(
                `SELECT 
                    c.COURSE_NAME,
                    COUNT(b.BOOKING_ID) AS TOTAL_BOOKINGS
                FROM BOOKING b
                JOIN TEE_TIME t ON b.TEE_TIME_ID = t.TEE_TIME_ID
                JOIN COURSE c ON t.COURSE_ID = c.COURSE_ID
                GROUP BY c.COURSE_NAME
                ORDER BY TOTAL_BOOKINGS DESC`, [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
    
            if (bookingCountByCourse.rows.length === 0 ){
                return res.status(200).json({ message: "No record currently in the database"});
            }
    
            res.status(201).json({ bookingCountByCourse: bookingCountByCourse.rows });

        } catch (err) {
            console.error('Signup error:', err);
            if (!res.headerSent) {
                res.status(500).json({ message: "Server error", error: err.message });
            }
        } finally {
            if (conn) {
                try {
                    await conn.close(); 
                } catch (err) {
                     console.error(err);
                }
            } 
        }
};

exports.equipmentUsageCount = async (req, res) => {
    let conn;
        try {
            conn = await getConnection();
    
            const equipmentUsage = await conn.execute(
                `SELECT e.EQUIPMENT_TYPE, COUNT(*) AS USAGE_COUNT
                FROM EQUIPMENT e
                GROUP BY e.EQUIPMENT_TYPE
                ORDER BY USAGE_COUNT DESC`, [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
    
            if (equipmentUsage.rows.length === 0 ){
                return res.status(200).json({ message: "No record currently in the database"});
            }
    
            res.status(201).json({ equipmentUsage: equipmentUsage.rows });

        } catch (err) {
            console.error('Signup error:', err);
            if (!res.headerSent) {
                res.status(500).json({ message: "Server error", error: err.message });
            }
        } finally {
            if (conn) {
                try {
                    await conn.close(); 
                } catch (err) {
                     console.error(err);
                }
            } 
        }
};