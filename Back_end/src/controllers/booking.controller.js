const { getConnection } = require("../config/db.js");
const oracledb = require("oracledb");

const getOffset = (page = 1, limit = 5) => (page - 1) * limit;

// ---------------- GET BOOKING LIST ----------------
exports.bookingList = async (req, res) => {
  let conn;
  const { status, page = 1, limit = 5 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 5, 100);

  try {
    conn = await getConnection();
    let baseQuery = `
      SELECT B.*, C.FULL_NAME AS CUSTOMER_NAME, CR.COURSE_NAME, T.START_TIME, T.END_TIME
      FROM BOOKING B
      LEFT JOIN CUSTOMER C ON B.CUSTOMER_ID = C.CUSTOMER_ID
      LEFT JOIN TEE_TIME T ON B.TEE_TIME_ID = T.TEE_TIME_ID
      LEFT JOIN COURSE CR ON T.COURSE_ID = CR.COURSE_ID
    `;

    const binds = {};
    if (status) {
      baseQuery += " WHERE B.STATUS = :status";
      binds.status = status.toUpperCase();
    }

    const countQuery = `SELECT COUNT(*) AS TOTAL FROM (${baseQuery})`;
    const countResult = await conn.execute(countQuery, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const totalRows = countResult.rows[0]?.TOTAL || 0;
    const totalPages = Math.ceil(totalRows / limitNum) || 1;

    const paginatedQuery = `
      ${baseQuery}
      ORDER BY B.BOOKING_ID DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;
    binds.offset = getOffset(pageNum, limitNum);
    binds.limit = limitNum;

    const result = await conn.execute(paginatedQuery, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.status(200).json({ bookings: result.rows || [], totalPages });
  } catch (err) {
    res.status(500).json({ bookings: [], totalPages: 1, message: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// ---------------- CREATE BOOKING (FIXED) ----------------
exports.addBooking = async (req, res) => {
  const { CUSTOMER_ID, TEE_TIME_ID, BOOKING_DATE, STATUS, TOTAL_PRICE } = req.body;
  let conn;
  try {
    conn = await getConnection();
    const formattedDate = BOOKING_DATE.split('T')[0]; // Critical for Oracle TO_DATE

    await conn.execute(
      `INSERT INTO BOOKING (BOOKING_ID, CUSTOMER_ID, TEE_TIME_ID, BOOKING_DATE, STATUS, TOTAL_PRICE)
       VALUES (BOOKING_SEQ.NEXTVAL, :cust, :tee, TO_DATE(:bdate, 'YYYY-MM-DD'), :stat, :price)`,
      { 
        cust: Number(CUSTOMER_ID), 
        tee: Number(TEE_TIME_ID), 
        bdate: formattedDate, 
        stat: STATUS.toUpperCase(), 
        price: Number(TOTAL_PRICE) 
      },
      { autoCommit: true }
    );
    res.status(201).json({ message: "Booking created" });
  } catch (err) {
    res.status(500).json({ message: "Create failed", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// ---------------- UPDATE BOOKING (FIXED) ----------------
exports.bookingUpdate = async (req, res) => {
  const { id } = req.params;
  const { CUSTOMER_ID, TEE_TIME_ID, BOOKING_DATE, STATUS, TOTAL_PRICE } = req.body;
  let conn;
  try {
    conn = await getConnection();
    const formattedDate = BOOKING_DATE.split('T')[0];

    await conn.execute(
      `UPDATE BOOKING SET 
        CUSTOMER_ID=:cust, TEE_TIME_ID=:tee, BOOKING_DATE=TO_DATE(:bdate, 'YYYY-MM-DD'), 
        STATUS=:stat, TOTAL_PRICE=:price 
       WHERE BOOKING_ID=:id`,
      { 
        cust: Number(CUSTOMER_ID), 
        tee: Number(TEE_TIME_ID), 
        bdate: formattedDate, 
        stat: STATUS.toUpperCase(), 
        price: Number(TOTAL_PRICE), 
        id: id 
      },
      { autoCommit: true }
    );
    res.status(200).json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// ---------------- DELETE, CONFIRM, CANCEL (KEEP YOURS) ----------------
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(`DELETE FROM BOOKING WHERE BOOKING_ID=:id`, { id }, { autoCommit: true });
    res.status(200).json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { if (conn) await conn.close(); }
};

exports.confirmBooking = async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(`UPDATE BOOKING SET STATUS='CONFIRMED' WHERE BOOKING_ID=:id`, { id }, { autoCommit: true });
    res.status(200).json({ message: "Confirmed" });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { if (conn) await conn.close(); }
};

exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(`UPDATE BOOKING SET STATUS='CANCELLED' WHERE BOOKING_ID=:id`, { id }, { autoCommit: true });
    res.status(200).json({ message: "Cancelled" });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { if (conn) await conn.close(); }
};