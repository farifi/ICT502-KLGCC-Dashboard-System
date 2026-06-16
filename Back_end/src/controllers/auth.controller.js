const bcrypt = require('bcryptjs');
const { getConnection } = require('../config/db.js');
const oracledb = require('oracledb');
const {
    signAccessToken,
    signRefreshToken,
    revokeRefreshToken,
    hasRefreshToken,
    getUserFromRefreshToken,
} = require('../utils/jwt');

exports.signup = async (req, res) => {
    const { full_name, email, phone_number, password } = req.body;
    let conn;

    try {
        if (!email || !password || !full_name) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        conn = await getConnection();

        const isStaff = email.endsWith('@klgcc.com');

        if (isStaff) {
            const existing = await conn.execute(
                `SELECT STAFFID FROM STAFF WHERE STAFFEMAIL = :email`,
                { email },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (existing.rows.length > 0) {
                return res.status(400).json({ message: "Email already exists" });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            await conn.execute(
                `INSERT INTO STAFF (STAFFID, STAFFNAME, STAFFEMAIL, STAFFPHONENUM, STAFFPASSWORD)
                 VALUES (STAFF_SEQ.NEXTVAL, :name, :email, :phone, :password)`,
                {
                    name:     full_name,
                    email:    email,
                    phone:    phone_number || null,
                    password: passwordHash,
                },
                { autoCommit: true }
            );

            return res.status(201).json({
                message: "Staff registered successfully",
                email,
                role: "staff"
            });

        } else {
            const existing = await conn.execute(
                `SELECT CUSTOMERID FROM CUSTOMER WHERE CUSTOMEREMAIL = :email`,
                { email },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (existing.rows.length > 0) {
                return res.status(400).json({ message: "Email already exists" });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            await conn.execute(
                `INSERT INTO CUSTOMER (CUSTOMERID, CUSTOMERNAME, CUSTOMEREMAIL, CUSTOMERPHONENUM, CUSTOMERPASSWORD)
                 VALUES (CUSTOMER_SEQ.NEXTVAL, :name, :email, :phone, :password)`,
                {
                    name:     full_name,
                    email:    email,
                    phone:    phone_number || null,
                    password: passwordHash,
                },
                { autoCommit: true }
            );

            return res.status(201).json({
                message: "Customer registered successfully",
                email,
                role: "customer"
            });
        }

    } catch (err) {
        console.error('Signup error:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error", error: err.message });
        }
    } finally {
        if (conn) {
            try { await conn.close(); } catch (err) { console.error(err); }
        }
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    let conn;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        conn = await getConnection();

        const isStaff = email.endsWith('@klgcc.com');
        let result;

        if (isStaff) {
            result = await conn.execute(
                `SELECT STAFFID, STAFFNAME, STAFFEMAIL, STAFFPASSWORD, STAFFPOSITION
                 FROM STAFF WHERE STAFFEMAIL = :email`,
                { email },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
        } else {
            result = await conn.execute(
                `SELECT CUSTOMERID, CUSTOMERNAME, CUSTOMEREMAIL, CUSTOMERPASSWORD
                 FROM CUSTOMER WHERE CUSTOMEREMAIL = :email`,
                { email },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
        }

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const dbUser = result.rows[0];

        const storedHash = isStaff ? dbUser.STAFFPASSWORD : dbUser.CUSTOMERPASSWORD;
        const isMatch = await bcrypt.compare(password, storedHash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = {
            id:       isStaff ? dbUser.STAFFID       : dbUser.CUSTOMERID,
            email:    isStaff ? dbUser.STAFFEMAIL     : dbUser.CUSTOMEREMAIL,
            name:     isStaff ? dbUser.STAFFNAME      : dbUser.CUSTOMERNAME,
            position: isStaff ? dbUser.STAFFPOSITION  : null,
            role:     isStaff ? 'staff'               : 'customer'
        };

        const accessToken  = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,       // set true in production with HTTPS
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            message: `${isStaff ? 'Staff' : 'Customer'} login successful`,
            accessToken,
            user
        });

    } catch (err) {
        console.error('Login error:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error", error: err.message });
        }
    } finally {
        if (conn) {
            try { await conn.close(); } catch (err) { console.error(err); }
        }
    }
};

exports.logout = (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token) revokeRefreshToken(token);
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
};

exports.refreshToken = (req, res) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        return res.status(401).json({ message: "No refresh token provided" });
    }
    if (!hasRefreshToken(token)) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    try {
        const storedUser     = getUserFromRefreshToken(token);
        const newAccessToken = signAccessToken(storedUser);
        return res.json({ accessToken: newAccessToken, user: storedUser });
    } catch (err) {
        revokeRefreshToken(token);
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

exports.protected = (req, res) => {
    return res.json({ message: "Protected data", user: req.user });
};