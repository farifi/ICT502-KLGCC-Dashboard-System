const { getConnection } = require("../config/db.js");
const oracledb = require("oracledb");

const getOffset = (page = 1, limit = 5) => (page - 1) * limit;

// GET CAR LIST (PAGINATED)
// Supports two mutually exclusive filters:
//   ?status=Available   -> CARSTATUS exactly matches (case-insensitive)
//   ?exclude=Available  -> CARSTATUS is anything EXCEPT this value
// "exclude" is what powers the "Unavailable Cars" table, since real
// CARSTATUS values are Available / Rented / Maintenance (no literal
// "Unavailable" row ever exists).
exports.carList = async (req, res) => {
  let conn;
  const { status, exclude, page = 1, limit = 5 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 5, 100);

  try {
    conn = await getConnection();

    let baseQuery = `SELECT * FROM CAR`;
    const binds = {};

    if (status) {
      baseQuery += ` WHERE UPPER(CARSTATUS) = UPPER(:status)`;
      binds.status = status;
    } else if (exclude) {
      baseQuery += ` WHERE UPPER(CARSTATUS) != UPPER(:exclude)`;
      binds.exclude = exclude;
    }

    const countResult = await conn.execute(
      `SELECT COUNT(*) AS TOTAL FROM (${baseQuery})`,
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const totalRows = countResult.rows[0]?.TOTAL || 0;
    const totalPages = Math.ceil(totalRows / limitNum) || 1;

    const paginatedQuery = `
      ${baseQuery}
      ORDER BY CARID DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;
    binds.offset = getOffset(pageNum, limitNum);
    binds.limit = limitNum;

    const result = await conn.execute(paginatedQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.status(200).json({ cars: result.rows || [], totalPages });
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ cars: [], totalPages: 1, message: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// CREATE CAR
exports.addCar = async (req, res) => {
  const { CARTYPE, CARBRAND, CARMODEL, CARPLATENO, CARCOLOUR, CARSEAT, CARFEE, CARSTATUS } = req.body;
  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `INSERT INTO CAR (CARID, CARTYPE, CARBRAND, CARMODEL, CARPLATENO, CARCOLOUR, CARSEAT, CARFEE, CARSTATUS)
       VALUES (CAR_SEQ.NEXTVAL, :type, :brand, :model, :plateno, :colour, :seat, :fee, :status)`,
      {
        type: CARTYPE,
        brand: CARBRAND,
        model: CARMODEL,
        plateno: CARPLATENO,
        colour: CARCOLOUR,
        seat: Number(CARSEAT),
        fee: Number(CARFEE),
        status: CARSTATUS || "Available",
      },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Car created successfully" });
  } catch (err) {
    console.error("Add Error:", err.message);
    res.status(500).json({ message: "Create failed", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// UPDATE CAR
exports.carUpdate = async (req, res) => {
  const { id } = req.params;
  const { CARTYPE, CARBRAND, CARMODEL, CARPLATENO, CARCOLOUR, CARSEAT, CARFEE, CARSTATUS } = req.body;
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `UPDATE CAR SET 
        CARTYPE = :type, 
        CARBRAND = :brand, 
        CARMODEL = :model, 
        CARPLATENO = :plateno,
        CARCOLOUR = :colour, 
        CARSEAT = :seat, 
        CARFEE = :fee, 
        CARSTATUS = :status
       WHERE CARID = :id`,
      {
        type: CARTYPE,
        brand: CARBRAND,
        model: CARMODEL,
        plateno: CARPLATENO,
        colour: CARCOLOUR,
        seat: Number(CARSEAT),
        fee: Number(CARFEE),
        status: CARSTATUS,
        id: Number(id),
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({ message: "Car updated successfully" });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ message: "Update failed", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// DELETE CAR
exports.deleteCar = async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `DELETE FROM CAR WHERE CARID = :id`,
      { id: Number(id) },
      { autoCommit: true }
    );

    res.status(200).json({ message: "Car deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ message: "Delete failed", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};