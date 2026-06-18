const { getConnection } = require('../config/db.js');
const oracledb = require('oracledb');

exports.getAllServices = async (req, res) => {
  let connection;
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    connection = await getConnection();

    // 1. Total count for pagination
    const countResult = await connection.execute(`SELECT COUNT(*) AS TOTAL FROM SERVICE`);
    const totalRows = countResult.rows[0].TOTAL || countResult.rows[0][0] || 0;

    // 2. Paginated service records
    const result = await connection.execute(
      `SELECT
         SERVICEID,
         CARID,
         SERVICEDATE,
         SERVICEDESCRIPTION,
         SERVICECOST,
         STAFFID,
         SERVICENEXTDATE
       FROM SERVICE
       ORDER BY SERVICEID ASC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      services:   result.rows,
      totalPages: Math.ceil(totalRows / limit) || 1
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.createService = async (req, res) => {
  const { CARID, SERVICEDATE, SERVICEDESCRIPTION, SERVICECOST, STAFFID, SERVICENEXTDATE } = req.body;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO SERVICE (CARID, SERVICEDATE, SERVICEDESCRIPTION, SERVICECOST, STAFFID, SERVICENEXTDATE)
       VALUES (:carid, :servicedate, :description, :cost, :staffid, :nextdate)`,
      {
        carid:       CARID,
        servicedate: SERVICEDATE ? new Date(SERVICEDATE) : null,
        description: SERVICEDESCRIPTION || null,
        cost:        SERVICECOST,
        staffid:     STAFFID || null,
        nextdate:    SERVICENEXTDATE ? new Date(SERVICENEXTDATE) : null
      },
      { autoCommit: true }
    );
    res.status(201).json({ message: "Service created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.updateService = async (req, res) => {
  const { id } = req.params;
  const { CARID, SERVICEDATE, SERVICEDESCRIPTION, SERVICECOST, STAFFID, SERVICENEXTDATE } = req.body;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE SERVICE
       SET CARID              = :carid,
           SERVICEDATE        = :servicedate,
           SERVICEDESCRIPTION = :description,
           SERVICECOST        = :cost,
           STAFFID            = :staffid,
           SERVICENEXTDATE    = :nextdate
       WHERE SERVICEID = :id`,
      {
        carid:       CARID,
        servicedate: SERVICEDATE ? new Date(SERVICEDATE) : null,
        description: SERVICEDESCRIPTION || null,
        cost:        SERVICECOST,
        staffid:     STAFFID || null,
        nextdate:    SERVICENEXTDATE ? new Date(SERVICENEXTDATE) : null,
        id
      },
      { autoCommit: true }
    );
    res.json({ message: "Service updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.deleteService = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `DELETE FROM SERVICE WHERE SERVICEID = :id`,
      { id },
      { autoCommit: true }
    );
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};