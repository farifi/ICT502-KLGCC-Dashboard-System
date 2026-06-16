const bcrypt = require('bcryptjs');
const { getConnection } = require('../config/db.js');
const oracledb = require('oracledb');

exports.staffList = async (req, res) => {
    let conn;

    try {
        conn = await getConnection();

        const staffList = await conn.execute(
            `SELECT
                s.STAFFID,
                s.STAFFNAME,
                s.STAFFEMAIL,
                s.STAFFPHONENUM,
                s.STAFFIC,
                s.STAFFPOSITION,
                s.SUPERVISORID,
                sup.STAFFNAME AS SUPERVISOR_NAME
            FROM STAFF s
            LEFT JOIN STAFF sup
                ON s.SUPERVISORID = sup.STAFFID
            ORDER BY s.STAFFID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (staffList.rows.length === 0) {
            return res.status(200).json({ message: "No record currently in the database" });
        }

        res.status(200).json({ staffs: staffList.rows });

    } catch (err) {
        console.error('staffList error:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error", error: err.message });
        }
    } finally {
        if (conn) {
            try { await conn.close(); } catch (err) { console.error(err); }
        }
    }
};

exports.createStaff = async (req, res) => {
    const { staffName, staffEmail, staffPhoneNum, staffIC, staffPosition, staffPassword, supervisorID } = req.body;
    let conn;

    try {
        if (!staffName || !staffEmail || !staffPassword) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        conn = await getConnection();

        const passwordHash = await bcrypt.hash(staffPassword, 10);

        const result = await conn.execute(
            `INSERT INTO STAFF (STAFFID, STAFFNAME, STAFFEMAIL, STAFFPHONENUM, STAFFIC, STAFFPOSITION, STAFFPASSWORD, SUPERVISORID)
             VALUES (STAFF_SEQ.NEXTVAL, :name, :email, :phone, :ic, :position, :password, :supervisorID)
             RETURNING STAFFID INTO :id`,
            {
                name:         staffName,
                email:        staffEmail,
                phone:        staffPhoneNum  || null,
                ic:           staffIC        || null,
                position:     staffPosition  || null,
                password:     passwordHash,
                supervisorID: supervisorID ? Number(supervisorID) : null,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: true }
        );

        const newStaffId = result.outBinds.id[0];

        const staff = await conn.execute(
            `SELECT
                s.STAFFID,
                s.STAFFNAME,
                s.STAFFEMAIL,
                s.STAFFPHONENUM,
                s.STAFFIC,
                s.STAFFPOSITION,
                s.SUPERVISORID,
                sup.STAFFNAME AS SUPERVISOR_NAME
             FROM STAFF s
             LEFT JOIN STAFF sup ON s.SUPERVISORID = sup.STAFFID
             WHERE s.STAFFID = :id`,
            { id: newStaffId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(201).json({ staff: staff.rows[0] });

    } catch (err) {
        console.error('createStaff error:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error", error: err.message });
        }
    } finally {
        if (conn) {
            try { await conn.close(); } catch (err) { console.error(err); }
        }
    }
};

exports.deleteStaff = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: 'Staff ID is required' });

    let conn;
    try {
        conn = await getConnection();

        const result = await conn.execute(
            `DELETE FROM STAFF WHERE STAFFID = :id`,
            { id },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        res.status(200).json({ message: "Staff deleted successfully" });

    } catch (error) {
        console.error('deleteStaff error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    } finally {
        if (conn) {
            try { await conn.close(); } catch (err) { console.error(err); }
        }
    }
};

exports.updateStaff = async (req, res) => {
    const { id } = req.params;
    const { staffName, staffEmail, staffPhoneNum, staffIC, staffPosition, supervisorID } = req.body;

    if (!id) return res.status(400).json({ message: 'Staff ID is required' });

    let conn;
    try {
        conn = await getConnection();

        const result = await conn.execute(
            `UPDATE STAFF SET
                STAFFNAME     = :name,
                STAFFEMAIL    = :email,
                STAFFPHONENUM = :phone,
                STAFFIC       = :ic,
                STAFFPOSITION = :position,
                SUPERVISORID  = :supervisorID
             WHERE STAFFID = :id`,
            {
                name:         staffName,
                email:        staffEmail,
                phone:        staffPhoneNum || null,
                ic:           staffIC       || null,
                position:     staffPosition || null,
                supervisorID: supervisorID ? Number(supervisorID) : null,
                id
            },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        res.status(200).json({ message: "Staff updated successfully" });

    } catch (error) {
        console.error('updateStaff error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    } finally {
        if (conn) {
            try { await conn.close(); } catch (err) { console.error(err); }
        }
    }
};