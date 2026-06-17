const bcrypt = require('bcryptjs');
const { getConnection } = require('../config/db.js');
const oracledb = require('oracledb');

// ─── Shared SELECT for Staff (with optional driver join) ─────────────────────
// Schema: STAFF(STAFFID, STAFFNAME, STAFFEMAIL, STAFFPHONENUM, STAFFIC,
//               STAFFPASSWORD, SUPERVISORID, STAFFPOSITION)
//         DRIVER(STAFFID FK, DRIVERID, LICENSETYPE)
const STAFF_SELECT = `
    SELECT
        s.STAFFID,
        s.STAFFNAME,
        s.STAFFEMAIL,
        s.STAFFPHONENUM,
        s.STAFFIC,
        s.STAFFPOSITION,
        s.SUPERVISORID,
        sup.STAFFNAME  AS SUPERVISOR_NAME,
        d.DRIVERID,
        d.LICENSETYPE
    FROM STAFF s
    LEFT JOIN STAFF sup ON s.SUPERVISORID = sup.STAFFID
    LEFT JOIN DRIVER d  ON d.STAFFID      = s.STAFFID
`;

// ─── All Staff ───────────────────────────────────────────────────────────────
exports.staffList = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();

        const result = await conn.execute(
            `${STAFF_SELECT} ORDER BY s.STAFFID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(200).json({ message: "No record currently in the database", staffs: [] });
        }

        res.status(200).json({ staffs: result.rows });

    } catch (err) {
        console.error('staffList error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

// ─── Staff who are Drivers (have a DRIVER row) ───────────────────────────────
exports.driverList = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();

        const result = await conn.execute(
            `${STAFF_SELECT}
             WHERE d.DRIVERID IS NOT NULL
             ORDER BY s.STAFFID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(200).json({ staffs: result.rows });

    } catch (err) {
        console.error('driverList error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

// ─── Staff who are NOT Drivers ───────────────────────────────────────────────
exports.nonDriverList = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();

        const result = await conn.execute(
            `${STAFF_SELECT}
             WHERE d.DRIVERID IS NULL
             ORDER BY s.STAFFID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(200).json({ staffs: result.rows });

    } catch (err) {
        console.error('nonDriverList error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

// ─── Create Staff (optionally also create Driver row) ────────────────────────
exports.createStaff = async (req, res) => {
    const {
        staffName, staffEmail, staffPhoneNum, staffIC,
        staffPosition, staffPassword, supervisorID,
        // Driver fields (optional)
        driverID, licenseType
    } = req.body;
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
                phone:        staffPhoneNum || null,
                ic:           staffIC       || null,
                position:     staffPosition || null,
                password:     passwordHash,
                supervisorID: supervisorID ? Number(supervisorID) : null,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: false }   // hold transaction open for optional driver insert
        );

        const newStaffId = result.outBinds.id[0];

        // If driver fields provided, insert into DRIVER table too
        if (driverID && licenseType) {
            await conn.execute(
                `INSERT INTO DRIVER (STAFFID, DRIVERID, LICENSETYPE)
                 VALUES (:staffId, :driverId, :licenseType)`,
                {
                    staffId:     newStaffId,
                    driverId:    driverID,
                    licenseType: licenseType
                },
                { autoCommit: false }
            );
        }

        await conn.commit();

        // Return the newly created staff row (with driver join)
        const staff = await conn.execute(
            `${STAFF_SELECT} WHERE s.STAFFID = :id`,
            { id: newStaffId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(201).json({ staff: staff.rows[0] });

    } catch (err) {
        if (conn) try { await conn.rollback(); } catch (e) { console.error(e); }
        console.error('createStaff error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

// ─── Update Staff ─────────────────────────────────────────────────────────────
exports.updateStaff = async (req, res) => {
    const { id } = req.params;
    const {
        staffName, staffEmail, staffPhoneNum, staffIC, staffPosition, supervisorID,
        // Driver fields (optional)
        driverID, licenseType
    } = req.body;

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
            { autoCommit: false }
        );

        if (result.rowsAffected === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Staff not found' });
        }

        // Upsert DRIVER row if driver fields provided
        if (driverID !== undefined || licenseType !== undefined) {
            const existing = await conn.execute(
                `SELECT DRIVERID FROM DRIVER WHERE STAFFID = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (existing.rows.length > 0) {
                // Update existing driver row
                await conn.execute(
                    `UPDATE DRIVER SET DRIVERID = :driverId, LICENSETYPE = :licenseType WHERE STAFFID = :id`,
                    { driverId: driverID || null, licenseType: licenseType || null, id },
                    { autoCommit: false }
                );
            } else if (driverID && licenseType) {
                // Insert new driver row
                await conn.execute(
                    `INSERT INTO DRIVER (STAFFID, DRIVERID, LICENSETYPE) VALUES (:id, :driverId, :licenseType)`,
                    { id, driverId: driverID, licenseType },
                    { autoCommit: false }
                );
            }
        }

        await conn.commit();
        res.status(200).json({ message: "Staff updated successfully" });

    } catch (err) {
        if (conn) try { await conn.rollback(); } catch (e) { console.error(e); }
        console.error('updateStaff error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

// ─── Delete Staff ─────────────────────────────────────────────────────────────
exports.deleteStaff = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Staff ID is required' });

    let conn;
    try {
        conn = await getConnection();

        // DRIVER row references STAFF via FK — delete it first if it exists
        await conn.execute(
            `DELETE FROM DRIVER WHERE STAFFID = :id`,
            { id },
            { autoCommit: false }
        );

        const result = await conn.execute(
            `DELETE FROM STAFF WHERE STAFFID = :id`,
            { id },
            { autoCommit: false }
        );

        if (result.rowsAffected === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Staff not found' });
        }

        await conn.commit();
        res.status(200).json({ message: "Staff deleted successfully" });

    } catch (err) {
        if (conn) try { await conn.rollback(); } catch (e) { console.error(e); }
        console.error('deleteStaff error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};