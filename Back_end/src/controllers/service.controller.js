const { getConnection } = require('../config/db.js');
const oracledb = require('oracledb');

exports.getAllEquipment = async (req, res) => {
  let connection;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    connection = await getConnection();

    // 1. Get Total Count for pagination
    const countResult = await connection.execute(`SELECT COUNT(*) AS TOTAL FROM EQUIPMENT`);
    const totalRows = countResult.rows[0].TOTAL || countResult.rows[0][0] || 0;

    // 2. Fetch paginated data with Customer Info
    const result = await connection.execute(
      `SELECT 
        e.EQUIPMENT_ID, 
        e.EQUIPMENT_TYPE, 
        e.FEE, 
        e.BOOKING_ID,
        c.FULL_NAME AS CUSTOMER_NAME
       FROM EQUIPMENT e
       LEFT JOIN BOOKING b ON e.BOOKING_ID = b.BOOKING_ID
       LEFT JOIN CUSTOMER c ON b.CUSTOMER_ID = c.CUSTOMER_ID
       ORDER BY e.EQUIPMENT_ID ASC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      equipment: result.rows,
      totalPages: Math.ceil(totalRows / limit) || 1
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.createEquipment = async (req, res) => {
  const { BOOKING_ID, EQUIPMENT_TYPE, FEE } = req.body;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO EQUIPMENT (BOOKING_ID, EQUIPMENT_TYPE, FEE)
       VALUES (:bookingId, :type, :fee)`,
      { bookingId: BOOKING_ID || null, type: EQUIPMENT_TYPE, fee: FEE },
      { autoCommit: true }
    );
    res.status(201).json({ message: "Equipment created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { BOOKING_ID, EQUIPMENT_TYPE, FEE } = req.body;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE EQUIPMENT SET BOOKING_ID = :bid, EQUIPMENT_TYPE = :type, FEE = :fee WHERE EQUIPMENT_ID = :id`,
      { bid: BOOKING_ID, type: EQUIPMENT_TYPE, fee: FEE, id },
      { autoCommit: true }
    );
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.deleteEquipment = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(`DELETE FROM EQUIPMENT WHERE EQUIPMENT_ID = :id`, { id }, { autoCommit: true });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};