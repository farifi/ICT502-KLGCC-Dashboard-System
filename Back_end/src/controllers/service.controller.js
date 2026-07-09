const { getConnection } = require('../config/db.js');
const oracledb = require('oracledb');

// GET ALL SERVICES
exports.getAllServices = async (req, res) => {
  let connection;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    connection = await getConnection();

    // Total records
    const countResult = await connection.execute(
      `SELECT COUNT(*) AS TOTAL FROM SERVICE`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const totalRows = countResult.rows[0].TOTAL;

    // Get paginated service list with Car Model & Staff Name
    const result = await connection.execute(
      `SELECT
          S.SERVICEID,
          C.CARMODEL AS CARMODEL,
          S.SERVICEDATE,
          S.SERVICEDESCRIPTION,
          S.SERVICECOST,
          ST.STAFFNAME AS STAFFNAME,
          S.SERVICENEXTDATE
       FROM SERVICE S
       LEFT JOIN CAR C
            ON S.CARID = C.CARID
       LEFT JOIN STAFF ST
            ON S.STAFFID = ST.STAFFID
       ORDER BY S.SERVICEID
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      services: result.rows,
      totalPages: Math.ceil(totalRows / limit) || 1
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};

// CREATE SERVICE
exports.createService = async (req, res) => {
  const {
    CARID,
    SERVICEDATE,
    SERVICEDESCRIPTION,
    SERVICECOST,
    STAFFID,
    SERVICENEXTDATE
  } = req.body;

  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `INSERT INTO SERVICE
        (SERVICEID, CARID, SERVICEDATE, SERVICEDESCRIPTION, SERVICECOST, STAFFID, SERVICENEXTDATE)
       VALUES
        (SERVICE_SEQ.NEXTVAL, :carid, :servicedate, :description, :cost, :staffid, :nextdate)`,
      {
        carid: Number(CARID),
        servicedate: SERVICEDATE ? new Date(SERVICEDATE) : null,
        description: SERVICEDESCRIPTION || null,
        cost: Number(SERVICECOST),
        staffid: STAFFID ? Number(STAFFID) : null,
        nextdate: SERVICENEXTDATE ? new Date(SERVICENEXTDATE) : null
      },
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Service created successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  } finally {
    if (connection) await connection.close();
  }
};

// UPDATE SERVICE
exports.updateService = async (req, res) => {
  const { id } = req.params;

  const {
    CARID,
    SERVICEDATE,
    SERVICEDESCRIPTION,
    SERVICECOST,
    STAFFID,
    SERVICENEXTDATE
  } = req.body;

  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `UPDATE SERVICE
       SET
          CARID = :carid,
          SERVICEDATE = :servicedate,
          SERVICEDESCRIPTION = :description,
          SERVICECOST = :cost,
          STAFFID = :staffid,
          SERVICENEXTDATE = :nextdate
       WHERE SERVICEID = :id`,
      {
        carid: Number(CARID),
        servicedate: SERVICEDATE ? new Date(SERVICEDATE) : null,
        description: SERVICEDESCRIPTION || null,
        cost: Number(SERVICECOST),
        staffid: STAFFID ? Number(STAFFID) : null,
        nextdate: SERVICENEXTDATE ? new Date(SERVICENEXTDATE) : null,
        id: Number(id)
      },
      { autoCommit: true }
    );

    res.json({
      message: "Service updated successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  } finally {
    if (connection) await connection.close();
  }
};

// DELETE SERVICE
exports.deleteService = async (req, res) => {
  const { id } = req.params;

  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `DELETE FROM SERVICE
       WHERE SERVICEID = :id`,
      { id: Number(id) },
      { autoCommit: true }
    );

    res.json({
      message: "Service deleted successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  } finally {
    if (connection) await connection.close();
  }
};