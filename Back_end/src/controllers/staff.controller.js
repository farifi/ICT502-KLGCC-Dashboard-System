const bcrypt = require("bcryptjs");
const { getConnection } = require("../config/db.js");
const oracledb = require("oracledb");


// =============================
// STAFF LIST
// =============================
exports.staffList = async (req, res) => {
    let conn;

    try {
        conn = await getConnection();

        const result = await conn.execute(
            `
            SELECT
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
            ORDER BY s.STAFFID
            `,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(200).json({
            staffs: result.rows
        });

    } catch (err) {
        console.error("staffList error:", err);
        res.status(500).json({ message: err.message });

    } finally {
        if (conn) await conn.close();
    }
};


// =============================
// DRIVER LIST (ONLY DRIVER TABLE)
// =============================
exports.driverList = async (req, res) => {
    let conn;

    try {
        conn = await getConnection();

        const result = await conn.execute(
            `
            SELECT
                s.STAFFID,
                s.STAFFNAME,
                s.STAFFEMAIL,
                s.STAFFPHONENUM,
                s.STAFFIC,
                s.STAFFPOSITION,
                d.DRIVERID,
                d.LICENSETYPE
            FROM DRIVER d
            JOIN STAFF s ON s.STAFFID = d.STAFFID
            ORDER BY s.STAFFID
            `,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(200).json({
            drivers: result.rows
        });

    } catch (err) {
        console.error("driverList error:", err);
        res.status(500).json({ message: err.message });

    } finally {
        if (conn) await conn.close();
    }
};


// =============================
// CREATE STAFF (WITH DRIVER INSERT)
// =============================
exports.createStaff = async (req, res) => {
    let conn;

    const {
        staffName,
        staffEmail,
        staffPhoneNum,
        staffIC,
        staffPosition,
        staffPassword,
        supervisorID,
        driverID,
        licenseType
    } = req.body;

    try {
        conn = await getConnection();

        const hashedPassword = await bcrypt.hash(staffPassword, 10);

        // 1. Insert into STAFF
        const staffResult = await conn.execute(
            `
            INSERT INTO STAFF (
                STAFFID,
                STAFFNAME,
                STAFFEMAIL,
                STAFFPHONENUM,
                STAFFIC,
                STAFFPOSITION,
                STAFFPASSWORD,
                SUPERVISORID
            )
            VALUES (
                STAFF_SEQ.NEXTVAL,
                :name,
                :email,
                :phone,
                :ic,
                :position,
                :password,
                :supervisorID
            )
            RETURNING STAFFID INTO :id
            `,
            {
                name: staffName,
                email: staffEmail,
                phone: staffPhoneNum || null,
                ic: staffIC || null,
                position: staffPosition,
                password: hashedPassword,
                supervisorID: supervisorID ? Number(supervisorID) : null,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: false }
        );

        const newStaffId = staffResult.outBinds.id[0];

        // 2. If staff is DRIVER → insert into DRIVER table
        if (staffPosition === "Driver") {
            await conn.execute(
                `
                INSERT INTO DRIVER (
                    STAFFID,
                    DRIVERID,
                    LICENSETYPE
                )
                VALUES (
                    :staffID,
                    :driverID,
                    :licenseType
                )
                `,
                {
                    staffID: newStaffId,
                    driverID: driverID || null,
                    licenseType: licenseType || null
                }
            );
        }

        await conn.commit();

        res.status(201).json({
            message: "Staff created successfully",
            staffID: newStaffId
        });

    } catch (err) {
        console.error("createStaff error:", err);

        if (conn) await conn.rollback();

        res.status(500).json({ message: err.message });

    } finally {
        if (conn) await conn.close();
    }
};


// =============================
// UPDATE STAFF
// =============================
exports.updateStaff = async (req, res) => {
    let conn;

    const { id } = req.params;

    const {
        staffName,
        staffEmail,
        staffPhoneNum,
        staffIC,
        staffPosition,
        supervisorID
    } = req.body;

    try {
        conn = await getConnection();

        await conn.execute(
            `
            UPDATE STAFF SET
                STAFFNAME = :name,
                STAFFEMAIL = :email,
                STAFFPHONENUM = :phone,
                STAFFIC = :ic,
                STAFFPOSITION = :position,
                SUPERVISORID = :supervisorID
            WHERE STAFFID = :id
            `,
            {
                name: staffName,
                email: staffEmail,
                phone: staffPhoneNum || null,
                ic: staffIC || null,
                position: staffPosition,
                supervisorID: supervisorID ? Number(supervisorID) : null,
                id
            },
            { autoCommit: true }
        );

        res.status(200).json({
            message: "Staff updated successfully"
        });

    } catch (err) {
        console.error("updateStaff error:", err);
        res.status(500).json({ message: err.message });

    } finally {
        if (conn) await conn.close();
    }
};


// =============================
// DELETE STAFF
// =============================
exports.deleteStaff = async (req, res) => {
    let conn;

    const { id } = req.params;

    try {
        conn = await getConnection();

        // delete driver first (if exists)
        await conn.execute(
            `DELETE FROM DRIVER WHERE STAFFID = :id`,
            { id }
        );

        // delete staff
        await conn.execute(
            `DELETE FROM STAFF WHERE STAFFID = :id`,
            { id },
            { autoCommit: true }
        );

        res.status(200).json({
            message: "Staff deleted successfully"
        });

    } catch (err) {
        console.error("deleteStaff error:", err);
        res.status(500).json({ message: err.message });

    } finally {
        if (conn) await conn.close();
    }
};