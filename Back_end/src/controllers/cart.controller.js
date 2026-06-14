const { getConnection } = require("../config/db.js");
const oracledb = require("oracledb");

exports.getCartWithBooking = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT ca.CART_ID, ca.CART_NUMBER, ca.RENTAL_FEE, ca.BOOKING_ID, 
              TO_CHAR(b.BOOKING_DATE, 'DD-Mon-YYYY HH:MI AM') AS BOOKING_DATE,
              cu.FULL_NAME AS CUSTOMER_NAME
       FROM CART ca
       LEFT JOIN BOOKING b ON ca.BOOKING_ID = b.BOOKING_ID
       LEFT JOIN CUSTOMER cu ON b.CUSTOMER_ID = cu.CUSTOMER_ID
       ORDER BY ca.CART_ID DESC`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.status(200).json({ carts: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

exports.createCart = async (req, res) => {
  const { BOOKING_ID, CART_NUMBER, RENTAL_FEE } = req.body;
  let conn;
  try {
    conn = await getConnection();
    const bId = (BOOKING_ID && BOOKING_ID !== "") ? Number(BOOKING_ID) : null;
    await conn.execute(
      `INSERT INTO CART (BOOKING_ID, CART_NUMBER, RENTAL_FEE)
       VALUES (:bookingId, :cartNum, :fee)`,
      { bookingId: bId, cartNum: CART_NUMBER, fee: Number(RENTAL_FEE) },
      { autoCommit: true }
    );
    res.status(201).json({ message: "Cart created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

exports.updateCart = async (req, res) => {
  const { id } = req.params;
  const { BOOKING_ID, CART_NUMBER, RENTAL_FEE } = req.body;
  let conn;
  try {
    conn = await getConnection();
    const bId = (BOOKING_ID && BOOKING_ID !== "") ? Number(BOOKING_ID) : null;
    await conn.execute(
      `UPDATE CART SET BOOKING_ID = :bid, CART_NUMBER = :cnum, RENTAL_FEE = :fee 
       WHERE CART_ID = :id`,
      { bid: bId, cnum: CART_NUMBER, fee: Number(RENTAL_FEE), id: Number(id) },
      { autoCommit: true }
    );
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

exports.deleteCart = async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(`DELETE FROM CART WHERE CART_ID = :id`, [id], { autoCommit: true });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

exports.getSimpleCart = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`SELECT * FROM CART`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ carts: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { if (conn) await conn.close(); }
};