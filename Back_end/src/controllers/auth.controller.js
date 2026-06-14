const bcrypt = require('bcryptjs');
const { getConnection } = require('../config/db.js');
const oracledb = require('oracledb');
const {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    revokeRefreshToken,
    hasRefreshToken,
    getUserFromRefreshToken,
} = require('../utils/jwt');

exports.signup = async (req, res) => {
    const { full_name, email, phone_number, password } = req.body;
    let conn;

    try{
        conn = await getConnection();

        const isStaff = email.endsWith('@klgcc.com');
        const table = isStaff ? 'STAFF' : 'CUSTOMER';
        const idColumn = isStaff ? 'STAFF_ID' : 'CUSTOMER_ID';
        
        // if email already exists
        const existing = await conn.execute(
            `SELECT ${idColumn} FROM ${table} WHERE EMAIL = :email`, [email],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        if (isStaff) {
            await conn.execute(
                `INSERT INTO STAFF (STAFF_ID, FULL_NAME, EMAIL, PHONE, PASSWORD_HASH)
                 VALUES (STAFF_SEQ.NEXTVAL, :full_name, :email, :phone, :password_hash)`,
                 {
                    full_name: full_name,
                    email,
                    phone: phone_number || null,
                    password_hash: passwordHash 
                 },
                 { autoCommit: true }
            );
        } else {
            await conn.execute(
                `INSERT INTO CUSTOMER (CUSTOMER_ID, FULL_NAME, EMAIL, PHONE_NUMBER, PASSWORD_HASH)
                 VALUES (CUSTOMER_SEQ.NEXTVAL, :full_name, :email, :phone, :password_hash)`,
                {
                    full_name: full_name,
                    email,
                    phone: phone_number || null,
                    password_hash: passwordHash
                },
                { autoCommit: true }
            );
        }
        
        res.status(201).json({
            message: `${isStaff ? 'Staff' : 'Customer'} registered successfully`,
            email,
            role: isStaff ? 'staff' : 'customer'
        });

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

    try{
        conn = await getConnection();
        
        let query, binds;
        const isStaff = email.endsWith('@klgcc.com');

        if (email.endsWith('@klgcc.com')) {
            // Staff login
            query = `SELECT STAFF_ID, FULL_NAME, EMAIL, PASSWORD_HASH FROM STAFF WHERE EMAIL = :email`;
            binds = [email];
        } else {
            // Customer login
            query = `SELECT CUSTOMER_ID, FULL_NAME, EMAIL, PASSWORD_HASH FROM CUSTOMER WHERE EMAIL = :email`;
            binds = [email];
        }

        const result = await conn.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT});

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password"});
        }

        const dbUser = result.rows[0];
        
        const isMatch = await bcrypt.compare(password, dbUser.PASSWORD_HASH);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Build normalized user object for tokens
        const user = {
            id: isStaff ? dbUser.STAFF_ID : dbUser.CUSTOMER_ID,
            email: dbUser.EMAIL,
            name: dbUser.FULL_NAME,
            role: isStaff ? 'staff' : 'customer'
        };

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        // Send refresh token as HttpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // set to true in production with HTTPS
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: `${isStaff ? 'Staff' : 'Customer'} login successful`,
            accessToken,
            user
        });


    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
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
}

exports.logout = (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token) {
        revokeRefreshToken(token);
    }
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
        verifyRefreshToken(token);
    } catch (err) {
        revokeRefreshToken(token);
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    const storedUser = getUserFromRefreshToken(token);
    const newAccessToken = signAccessToken(storedUser);

    return res.json({ accessToken: newAccessToken, user: storedUser });
};

// This endpoint now uses the authenticateToken middleware
// The middleware attaches req.user, so we can just return it
exports.protected = (req, res) => {
    return res.json({
        message: "Protected data",
        user: req.user // User info attached by authenticateToken middleware
    });
};
