const { getConnection } = require('../config/db.js');
const oracledb = require('oracledb');

exports.totalRentalRevenue = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT c.CARTYPE, SUM(r.RENTALTOTALCOST) AS TOTAL_REVENUE
             FROM RENTAL r
             JOIN CAR c ON r.CARID = c.CARID
             GROUP BY c.CARTYPE
             ORDER BY TOTAL_REVENUE DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.status(200).json({ totalRentalRevenue: result.rows || [] });
    } catch (err) {
        console.error('Dashboard error (totalRentalRevenue):', err);
        res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

exports.rentalTrend = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT TO_CHAR(r.RENTALPICKUPDATE, 'DD Mon YYYY') AS RENTAL_DATE,
                    COUNT(*) AS TOTAL_RENTALS
             FROM RENTAL r
             GROUP BY r.RENTALPICKUPDATE
             ORDER BY r.RENTALPICKUPDATE`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.status(200).json({ rentalTrend: result.rows || [] });
    } catch (err) {
        console.error('Dashboard error (rentalTrend):', err);
        res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

exports.averageRentalPricePerStaff = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT s.STAFFNAME, ROUND(AVG(r.RENTALTOTALCOST), 2) AS AVG_RENTAL_PRICE
             FROM RENTAL r
             LEFT JOIN STAFF s ON r.STAFFID = s.STAFFID
             WHERE s.STAFFNAME IS NOT NULL
             GROUP BY s.STAFFNAME
             ORDER BY AVG_RENTAL_PRICE DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.status(200).json({ averageRentalPricePerStaff: result.rows || [] });
    } catch (err) {
        console.error('Dashboard error (averageRentalPricePerStaff):', err);
        res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

exports.rentalCountByCarType = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT c.CARTYPE, COUNT(r.RENTALID) AS TOTAL_RENTALS
             FROM RENTAL r
             JOIN CAR c ON r.CARID = c.CARID
             GROUP BY c.CARTYPE
             ORDER BY TOTAL_RENTALS DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.status(200).json({ rentalCountByCarType: result.rows || [] });
    } catch (err) {
        console.error('Dashboard error (rentalCountByCarType):', err);
        res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

exports.serviceFrequency = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT c.CARTYPE, COUNT(*) AS SERVICE_COUNT
             FROM SERVICE sv
             JOIN CAR c ON sv.CARID = c.CARID
             GROUP BY c.CARTYPE
             ORDER BY SERVICE_COUNT DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.status(200).json({ serviceFrequency: result.rows || [] });
    } catch (err) {
        console.error('Dashboard error (serviceFrequency):', err);
        res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};