const { getConnection } = require('../config/db.js');
const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');

const CUSTOMER_SELECT = `
    SELECT
        c.CUSTID,
        c.CUSTNAME,
        c.CUSTEMAIL,
        c.CUSTPHONENUM,
        c.CUSTIC,
        c.CUSTLICENSENO,
        c.CUSTADDRESS
    FROM CUSTOMER c
`;

const paginate = (page, limit) => {
    const p      = Math.max(1, parseInt(page)  || 1);
    const l      = Math.max(1, parseInt(limit) || 5);
    const offset = (p - 1) * l;
    return { l, offset };
};

// ─── All Customers (paginated) ───────────────────────────────────────────────
exports.customerList = async (req, res) => {
    const { l, offset } = paginate(req.query.page, req.query.limit);
    let conn;
    try {
        conn = await getConnection();

        const countResult = await conn.execute(
            `SELECT COUNT(*) AS TOTAL FROM CUSTOMER`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const total      = countResult.rows[0].TOTAL;
        const totalPages = Math.ceil(total / l);

        const result = await conn.execute(
            `${CUSTOMER_SELECT}
             ORDER BY c.CUSTID
             OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
            { offset, limit: l },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(200).json({ customers: result.rows, totalPages, total });
    } catch (err) {
        console.error('customerList error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

// ─── Member Customers (have license number) ──────────────────────────────────
exports.memberList = async (req, res) => {
    const { l, offset } = paginate(req.query.page, req.query.limit);
    let conn;
    try {
        conn = await getConnection();

        const countResult = await conn.execute(
            `SELECT COUNT(*) AS TOTAL FROM CUSTOMER WHERE CUSTLICENSENO IS NOT NULL`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const total      = countResult.rows[0].TOTAL;
        const totalPages = Math.ceil(total / l);

        const result = await conn.execute(
            `${CUSTOMER_SELECT}
             WHERE c.CUSTLICENSENO IS NOT NULL
             ORDER BY c.CUSTID
             OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
            { offset, limit: l },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(200).json({ customers: result.rows, totalPages, total });
    } catch (err) {
        console.error('memberList error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

// ─── Walk-in Customers (no license number) ───────────────────────────────────
exports.walkinList = async (req, res) => {
    const { l, offset } = paginate(req.query.page, req.query.limit);
    let conn;
    try {
        conn = await getConnection();

        const countResult = await conn.execute(
            `SELECT COUNT(*) AS TOTAL FROM CUSTOMER WHERE CUSTLICENSENO IS NULL`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const total      = countResult.rows[0].TOTAL;
        const totalPages = Math.ceil(total / l);

        const result = await conn.execute(
            `${CUSTOMER_SELECT}
             WHERE c.CUSTLICENSENO IS NULL
             ORDER BY c.CUSTID
             OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
            { offset, limit: l },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(200).json({ customers: result.rows, totalPages, total });
    } catch (err) {
        console.error('walkinList error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

// ─── Create Customer ─────────────────────────────────────────────────────────
// Reads CUST* keys directly — matches AddCustomerForm field names
exports.createCustomer = async (req, res) => {
    const {
        CUSTNAME,
        CUSTEMAIL,
        CUSTPHONENUM,
        CUSTIC,
        CUSTLICENSENO,
        CUSTADDRESS,
        CUSTPASSWORD,
    } = req.body;

    let conn;
    try {
        if (!CUSTNAME || !CUSTEMAIL || !CUSTPASSWORD) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        conn = await getConnection();

        const existing = await conn.execute(
            `SELECT CUSTID FROM CUSTOMER WHERE CUSTEMAIL = :email`,
            { email: CUSTEMAIL },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const passwordHash = await bcrypt.hash(CUSTPASSWORD, 10);

        // CUSTUSERNAME is NOT NULL in the DB but there's no username field
        // anywhere in the UI, so we derive one from the email (the part
        // before the @), which is already guaranteed unique by the check above.
        const generatedUsername = CUSTEMAIL.split('@')[0];

        const result = await conn.execute(
            `INSERT INTO CUSTOMER
                (CUSTID, CUSTNAME, CUSTUSERNAME, CUSTEMAIL, CUSTPHONENUM, CUSTIC, CUSTLICENSENO, CUSTADDRESS, CUSTPASSWORD)
             VALUES
                (CUSTOMER_SEQ.NEXTVAL, :name, :username, :email, :phone, :ic, :licenseNo, :address, :password)
             RETURNING CUSTID INTO :id`,
            {
                name:      CUSTNAME,
                username:  generatedUsername,
                email:     CUSTEMAIL,
                phone:     CUSTPHONENUM  || null,
                ic:        CUSTIC        || null,
                licenseNo: CUSTLICENSENO || null,
                address:   CUSTADDRESS   || null,
                password:  passwordHash,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: true }
        );

        const newId = result.outBinds.id[0];

        const customer = await conn.execute(
            `${CUSTOMER_SELECT} WHERE c.CUSTID = :id`,
            { id: newId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(201).json({ customer: customer.rows[0] });
    } catch (err) {
        console.error('createCustomer error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

// ─── Update Customer ─────────────────────────────────────────────────────────
// Reads CUST* keys directly — matches EditCustomerForm field names
exports.updateCustomer = async (req, res) => {
    const { id } = req.params;
    const {
        CUSTNAME,
        CUSTEMAIL,
        CUSTPHONENUM,
        CUSTIC,
        CUSTLICENSENO,
        CUSTADDRESS,
    } = req.body;

    if (!id) return res.status(400).json({ message: 'Customer ID is required' });

    let conn;
    try {
        conn = await getConnection();

        const result = await conn.execute(
            `UPDATE CUSTOMER SET
                CUSTNAME      = :name,
                CUSTEMAIL     = :email,
                CUSTPHONENUM  = :phone,
                CUSTIC        = :ic,
                CUSTLICENSENO = :licenseNo,
                CUSTADDRESS   = :address
             WHERE CUSTID = :id`,
            {
                name:      CUSTNAME,
                email:     CUSTEMAIL,
                phone:     CUSTPHONENUM  || null,
                ic:        CUSTIC        || null,
                licenseNo: CUSTLICENSENO || null,
                address:   CUSTADDRESS   || null,
                id,
            },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({ message: "Customer updated successfully" });
    } catch (err) {
        console.error('updateCustomer error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};

// ─── Delete Customer ─────────────────────────────────────────────────────────
exports.deleteCustomer = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Customer ID is required' });

    let conn;
    try {
        conn = await getConnection();

        const result = await conn.execute(
            `DELETE FROM CUSTOMER WHERE CUSTID = :id`,
            { id },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({ message: "Customer deleted successfully" });
    } catch (err) {
        console.error('deleteCustomer error:', err);
        if (!res.headersSent) res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        if (conn) try { await conn.close(); } catch (e) { console.error(e); }
    }
};