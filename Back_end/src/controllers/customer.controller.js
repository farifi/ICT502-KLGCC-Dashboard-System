const { getConnection } = require("../config/db.js");
const oracledb = require("oracledb");

exports.customerList = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT CUSTOMER_ID, FULL_NAME, EMAIL, PHONE_NUMBER FROM CUSTOMER`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({ customers: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

exports.customerListPaged = async (req, res) => {
  let conn;
  const { page = 1, limit = 5 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 5, 100);
  const offset = (pageNum - 1) * limitNum;

  try {
    conn = await getConnection();

    const baseQuery = `
      SELECT CUSTOMER_ID, FULL_NAME, EMAIL, PHONE_NUMBER
      FROM CUSTOMER
    `;

    // Count rows
    const countResult = await conn.execute(
      `SELECT COUNT(*) AS TOTAL FROM (${baseQuery})`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const totalRows = countResult.rows[0]?.TOTAL || 0;
    const totalPages = Math.ceil(totalRows / limitNum) || 1;

    // Fetch paged result
    const result = await conn.execute(
      `${baseQuery}
       ORDER BY CUSTOMER_ID
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { offset, limit: limitNum },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      customers: result.rows,
      totalPages
    });

  } catch (err) {
    console.error("Paged Customer Error:", err);
    res.status(500).json({ message: "Server error fetching paged customers", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

exports.memberCustomerList = async (req, res) => {
  let conn;
  const { page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;

  try {
    conn = await getConnection();

    const baseQuery = `
      SELECT 
        C.CUSTOMER_ID,
        C.FULL_NAME,
        C.EMAIL,
        C.PHONE_NUMBER
      FROM CUSTOMER C
      JOIN MEMBER_CUSTOMER M
        ON C.CUSTOMER_ID = M.CUSTOMER_ID
    `;

    const countResult = await conn.execute(
      `SELECT COUNT(*) AS TOTAL FROM (${baseQuery})`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const totalRows = countResult.rows[0]?.TOTAL || 0;
    const totalPages = Math.ceil(totalRows / limit);

    const result = await conn.execute(
      `${baseQuery}
       ORDER BY C.CUSTOMER_ID
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      customers: result.rows,
      totalPages: totalPages || 1
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};


// ===============================
// Walk-in Customer List (Paginated)
// ===============================
exports.walkinCustomerList = async (req, res) => {
  let conn;
  const { page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;

  try {
    conn = await getConnection();

    const baseQuery = `
      SELECT 
        C.CUSTOMER_ID,
        C.FULL_NAME,
        C.EMAIL,
        C.PHONE_NUMBER
      FROM CUSTOMER C
      JOIN WALK_IN_CUSTOMER W
        ON C.CUSTOMER_ID = W.CUSTOMER_ID
    `;

    const countResult = await conn.execute(
      `SELECT COUNT(*) AS TOTAL FROM (${baseQuery})`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const totalRows = countResult.rows[0]?.TOTAL || 0;
    const totalPages = Math.ceil(totalRows / limit);

    const result = await conn.execute(
      `${baseQuery}
       ORDER BY C.CUSTOMER_ID
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      customers: result.rows,
      totalPages: totalPages || 1
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

exports.addCustomer = async (req, res) => {
  const { FULL_NAME, EMAIL, PHONE_NUMBER, MEMBERSHIP_TYPE } = req.body;
  let conn;

  try {
    if (!FULL_NAME || !EMAIL || !PHONE_NUMBER) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    conn = await getConnection();

    // Insert into CUSTOMER (auto IDENTITY)
    const result = await conn.execute(
      `INSERT INTO CUSTOMER (FULL_NAME, EMAIL, PHONE_NUMBER)
       VALUES (:FULL_NAME, :EMAIL, :PHONE_NUMBER)
       RETURNING CUSTOMER_ID INTO :id`,
      {
        FULL_NAME,
        EMAIL,
        PHONE_NUMBER,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: false }
    );

    const customerId = result.outBinds.id[0];

    // If new customer is a member
    if (MEMBERSHIP_TYPE) {
      await conn.execute(
        `INSERT INTO MEMBER_CUSTOMER
         (CUSTOMER_ID, MEMBERSHIP_ID, START_DATE, END_DATE, STATUS, MEMBERSHIP_TYPE)
         VALUES (:cid, 'AUTO-' || :cid, SYSDATE, SYSDATE + 365, 'ACTIVE', :mtype)`,
        { cid: customerId, mtype: MEMBERSHIP_TYPE },
      );
    } else {
      await conn.execute(
        `INSERT INTO WALK_IN_CUSTOMER (CUSTOMER_ID) VALUES (:cid)`,
        { cid: customerId },
      );
    }

    await conn.commit();

    res.status(201).json({ message: "Customer created successfully" });

  } catch (err) {
    console.error("Add Customer:", err);
    res.status(500).json({ message: "Server error adding customer", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { FULL_NAME, EMAIL, PHONE_NUMBER } = req.body;
  let conn;

  try {
    if (!FULL_NAME || !EMAIL || !PHONE_NUMBER) {
      return res.status(400).json({ message: "Missing fields" });
    }

    conn = await getConnection();
    await conn.execute(
      `UPDATE CUSTOMER
       SET FULL_NAME=:FULL_NAME,
           EMAIL=:EMAIL,
           PHONE_NUMBER=:PHONE_NUMBER
       WHERE CUSTOMER_ID=:id`,
      { FULL_NAME, EMAIL, PHONE_NUMBER, id },
      { autoCommit: true }
    );

    res.status(200).json({ message: "Customer updated successfully" });

  } catch (err) {
    console.error("Update Customer:", err);
    res.status(500).json({ message: "Server error updating customer", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};


exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  let conn;

  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM CUSTOMER WHERE CUSTOMER_ID=:id`,
      { id },
      { autoCommit: true }
    );

    res.status(200).json({ message: "Customer deleted successfully" });

  } catch (err) {
    console.error("Delete Customer:", err);
    res.status(500).json({ message: "Server error deleting customer", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};
