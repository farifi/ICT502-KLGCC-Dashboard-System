const { getConnection } = require("../config/db.js");
const oracledb = require("oracledb");

// GET ALL PAYMENTS (PAGINATED)
exports.getPaymentList = async (req, res) => {
  let conn;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    conn = await getConnection();

    const countResult = await conn.execute(
      `SELECT COUNT(*) AS TOTAL FROM PAYMENT`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const totalRows = countResult.rows[0]?.TOTAL || 0;

    const result = await conn.execute(
      `SELECT PAYMENTID, PAYMENTAMOUNT, PAYMENTMETHOD, 
              TO_CHAR(PAYMENTDATE, 'YYYY-MM-DD') AS PAYMENTDATE, 
              PAYMENTSTATUS 
       FROM PAYMENT 
       ORDER BY PAYMENTID DESC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      payments: result.rows,
      totalPages: Math.ceil(totalRows / limit) || 1,
    });
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// CREATE PAYMENT
exports.createPayment = async (req, res) => {
  const { PAYMENTAMOUNT, PAYMENTMETHOD, PAYMENTDATE, PAYMENTSTATUS } = req.body;
  let conn;
  try {
    conn = await getConnection();

    const sql = `INSERT INTO PAYMENT (PAYMENTID, PAYMENTAMOUNT, PAYMENTMETHOD, PAYMENTDATE, PAYMENTSTATUS)
                 VALUES (PAYMENT_SEQ.NEXTVAL, :b_amount, :b_method, TO_DATE(:b_date, 'YYYY-MM-DD'), :b_status)`;

    const binds = {
      b_amount: Number(PAYMENTAMOUNT),
      b_method: PAYMENTMETHOD,
      b_date: PAYMENTDATE,
      b_status: PAYMENTSTATUS,
    };

    await conn.execute(sql, binds, { autoCommit: true });
    res.status(201).json({ message: "Payment created successfully" });
  } catch (err) {
    console.error("Add Error:", err.message);
    res.status(500).json({ message: "Database rejected the add", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// UPDATE PAYMENT
exports.updatePayment = async (req, res) => {
  const { id } = req.params;
  const { PAYMENTAMOUNT, PAYMENTMETHOD, PAYMENTDATE, PAYMENTSTATUS } = req.body;
  let conn;
  try {
    conn = await getConnection();

    const sql = `UPDATE PAYMENT 
                 SET PAYMENTAMOUNT = :b_amount, 
                     PAYMENTMETHOD = :b_method, 
                     PAYMENTDATE = TO_DATE(:b_date, 'YYYY-MM-DD'), 
                     PAYMENTSTATUS = :b_status
                 WHERE PAYMENTID = :b_id`;

    const binds = {
      b_amount: Number(PAYMENTAMOUNT),
      b_method: PAYMENTMETHOD,
      b_date: PAYMENTDATE,
      b_status: PAYMENTSTATUS,
      b_id: Number(id),
    };

    const result = await conn.execute(sql, binds, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment updated successfully" });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ message: "Update failed", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// DELETE PAYMENT
exports.deletePayment = async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `DELETE FROM PAYMENT WHERE PAYMENTID = :b_id`,
      { b_id: Number(id) },
      { autoCommit: true }
    );

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ message: "Delete failed", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};