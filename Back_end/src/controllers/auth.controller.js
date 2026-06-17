const bcrypt = require("bcryptjs");
const { getConnection } = require("../config/db.js");
const oracledb = require("oracledb");

const {
    signAccessToken,
    signRefreshToken,
    revokeRefreshToken,
    hasRefreshToken,
    getUserFromRefreshToken,
} = require("../utils/jwt");


// =============================
// SIGNUP
// =============================
exports.signup = async (req, res) => {
    const {
        full_name,
        email,
        phone_number,
        password
    } = req.body;

    let conn;

    try {
        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: "Full name, email and password are required"
            });
        }

        conn = await getConnection();

        const isStaff = email.endsWith("@klgcc.com");

        const hashedPassword = await bcrypt.hash(password, 10);

        // =============================
        // STAFF SIGNUP
        // =============================
        if (isStaff) {

            const existing = await conn.execute(
                `SELECT STAFFID FROM STAFF WHERE STAFFEMAIL = :email`,
                { email },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (existing.rows.length > 0) {
                return res.status(400).json({ message: "Email already exists" });
            }

            const result = await conn.execute(
                `
                INSERT INTO STAFF (
                    STAFFID,
                    STAFFNAME,
                    STAFFEMAIL,
                    STAFFPHONENUM,
                    STAFFPASSWORD
                )
                VALUES (
                    STAFF_SEQ.NEXTVAL,
                    :name,
                    :email,
                    :phone,
                    :password
                )
                RETURNING STAFFID INTO :id
                `,
                {
                    name: full_name,
                    email,
                    phone: phone_number || null,
                    password: hashedPassword,
                    id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                { autoCommit: true }
            );

            return res.status(201).json({
                message: "Staff registered successfully",
                staffID: result.outBinds.id[0],
                role: "staff"
            });
        }

        // =============================
        // CUSTOMER SIGNUP
        // =============================
        const existingCustomer = await conn.execute(
            `SELECT CUSTID FROM CUSTOMER WHERE CUSTEMAIL = :email`,
            { email },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (existingCustomer.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        await conn.execute(
            `
            INSERT INTO CUSTOMER (
                CUSTID,
                CUSTNAME,
                CUSTEMAIL,
                CUSTPHONENUM,
                CUSTPASSWORD
            )
            VALUES (
                CUSTOMER_SEQ.NEXTVAL,
                :name,
                :email,
                :phone,
                :password
            )
            `,
            {
                name: full_name,
                email,
                phone: phone_number || null,
                password: hashedPassword
            },
            { autoCommit: true }
        );

        return res.status(201).json({
            message: "Customer registered successfully",
            role: "customer"
        });

    } catch (err) {
        console.error("Signup error:", err);

        if (!res.headersSent) {
            res.status(500).json({
                message: "Server error",
                error: err.message
            });
        }

    } finally {
        if (conn) await conn.close();
    }
};


// =============================
// LOGIN
// =============================
exports.login = async (req, res) => {
    const { email, password } = req.body;
    let conn;

    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        conn = await getConnection();

        const isStaff = email.endsWith("@klgcc.com");

        let result;

        if (isStaff) {
            result = await conn.execute(
                `
                SELECT
                    STAFFID,
                    STAFFNAME,
                    STAFFEMAIL,
                    STAFFPASSWORD,
                    STAFFPOSITION
                FROM STAFF
                WHERE STAFFEMAIL = :email
                `,
                { email },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
        } else {
            result = await conn.execute(
                `
                SELECT
                    CUSTID,
                    CUSTNAME,
                    CUSTEMAIL,
                    CUSTPASSWORD
                FROM CUSTOMER
                WHERE CUSTEMAIL = :email
                `,
                { email },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
        }

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const dbUser = result.rows[0];

        const storedPassword = isStaff
            ? dbUser.STAFFPASSWORD
            : dbUser.CUSTPASSWORD;

        const match = await bcrypt.compare(password, storedPassword);

        if (!match) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = {
            id: isStaff ? dbUser.STAFFID : dbUser.CUSTID,
            name: isStaff ? dbUser.STAFFNAME : dbUser.CUSTNAME,
            email: isStaff ? dbUser.STAFFEMAIL : dbUser.CUSTEMAIL,
            role: isStaff ? "staff" : "customer",
            position: isStaff ? dbUser.STAFFPOSITION : null
        };

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            message: "Login successful",
            accessToken,
            user
        });

    } catch (err) {
        console.error("Login error:", err);

        if (!res.headersSent) {
            res.status(500).json({
                message: "Server error",
                error: err.message
            });
        }

    } finally {
        if (conn) await conn.close();
    }
};


// =============================
// LOGOUT
// =============================
exports.logout = (req, res) => {
    const token = req.cookies?.refreshToken;

    if (token) revokeRefreshToken(token);

    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
};


// =============================
// REFRESH TOKEN
// =============================
exports.refreshToken = (req, res) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        return res.status(401).json({
            message: "No refresh token provided"
        });
    }

    if (!hasRefreshToken(token)) {
        return res.status(403).json({
            message: "Invalid refresh token"
        });
    }

    try {
        const user = getUserFromRefreshToken(token);
        const newAccessToken = signAccessToken(user);

        return res.json({
            accessToken: newAccessToken,
            user
        });

    } catch (err) {
        revokeRefreshToken(token);

        return res.status(403).json({
            message: "Invalid refresh token"
        });
    }
};


// =============================
// PROTECTED ROUTE
// =============================
exports.protected = (req, res) => {
    res.json({
        message: "Protected data",
        user: req.user
    });
};