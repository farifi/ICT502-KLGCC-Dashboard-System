const { getConnection } = require("../config/db.js");
const oracledb = require("oracledb");

exports.getRentalWithDetails = async (req, res) => {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `
      SELECT
          r.RENTALID,
          r.PAYMENTID,
          r.CUSTID,
          r.CARID,

          TO_CHAR(r.RENTALPICKUPDATE, 'DD-MON-YYYY') AS RENTALPICKUPDATE,
          TO_CHAR(r.RENTALRETURNDATE, 'DD-MON-YYYY') AS RENTALRETURNDATE,

          r.RENTALPICKUPTIME,
          r.RENTALRETURNTIME,
          r.RENTALADDRESS,
          r.RENTALTOTALCOST,
          r.RENTALSTATUS,
          r.STAFFID,

          cu.CUSTNAME AS CUSTOMER_NAME,
          ca.CARPLATENO AS CAR_PLATENO

      FROM RENTAL r

      LEFT JOIN CUSTOMER cu
          ON r.CUSTID = cu.CUSTID

      LEFT JOIN CAR ca
          ON r.CARID = ca.CARID

      ORDER BY r.RENTALID DESC
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );

    res.status(200).json({
      rentals: result.rows
    });

  } catch (err) {
    console.error("Get Rental With Details Error:", err);

    res.status(500).json({
      message: "Server Error",
      error: err.message
    });

  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (e) {
        console.error(e);
      }
    }
  }
};

// CREATE RENTAL
exports.createRental = async (req, res) => {
  const {
    PAYMENTID, CUSTID, CARID,
    RENTALPICKUPDATE, RENTALRETURNDATE,
    RENTALPICKUPTIME, RENTALRETURNTIME,
    RENTALADDRESS, RENTALTOTALCOST,
    RENTALSTATUS, STAFFID
  } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `INSERT INTO RENTAL 
         (RENTALID, PAYMENTID, CUSTID, CARID, RENTALPICKUPDATE, RENTALRETURNDATE,
          RENTALPICKUPTIME, RENTALRETURNTIME, RENTALADDRESS, RENTALTOTALCOST,
          RENTALSTATUS, STAFFID)
       VALUES 
         (RENTAL_SEQ.NEXTVAL, :paymentid, :custid, :carid, :pickupdate, :returndate,
          :pickuptime, :returntime, :address, :totalcost,
          :status, :staffid)`,
      {
        paymentid:  PAYMENTID  ? Number(PAYMENTID)  : null,
        custid:     Number(CUSTID),
        carid:      Number(CARID),
        pickupdate: RENTALPICKUPDATE  ? new Date(RENTALPICKUPDATE)  : null,
        returndate: RENTALRETURNDATE  ? new Date(RENTALRETURNDATE)  : null,
        pickuptime: RENTALPICKUPTIME  || null,
        returntime: RENTALRETURNTIME  || null,
        address:    RENTALADDRESS     || null,
        totalcost:  RENTALTOTALCOST   ? Number(RENTALTOTALCOST) : null,
        status:     RENTALSTATUS      || null,
        staffid:    STAFFID           ? Number(STAFFID) : null
      },
      { autoCommit: true }
    );
    res.status(201).json({ message: "Rental created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// UPDATE RENTAL
exports.updateRental = async (req, res) => {
  const { id } = req.params;
  const {
    PAYMENTID, CUSTID, CARID,
    RENTALPICKUPDATE, RENTALRETURNDATE,
    RENTALPICKUPTIME, RENTALRETURNTIME,
    RENTALADDRESS, RENTALTOTALCOST,
    RENTALSTATUS, STAFFID
  } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `UPDATE RENTAL SET
         PAYMENTID        = :paymentid,
         CUSTID           = :custid,
         CARID            = :carid,
         RENTALPICKUPDATE = :pickupdate,
         RENTALRETURNDATE = :returndate,
         RENTALPICKUPTIME = :pickuptime,
         RENTALRETURNTIME = :returntime,
         RENTALADDRESS    = :address,
         RENTALTOTALCOST  = :totalcost,
         RENTALSTATUS     = :status,
         STAFFID          = :staffid
       WHERE RENTALID = :id`,
      {
        paymentid:  PAYMENTID  ? Number(PAYMENTID)  : null,
        custid:     Number(CUSTID),
        carid:      Number(CARID),
        pickupdate: RENTALPICKUPDATE  ? new Date(RENTALPICKUPDATE)  : null,
        returndate: RENTALRETURNDATE  ? new Date(RENTALRETURNDATE)  : null,
        pickuptime: RENTALPICKUPTIME  || null,
        returntime: RENTALRETURNTIME  || null,
        address:    RENTALADDRESS     || null,
        totalcost:  RENTALTOTALCOST   ? Number(RENTALTOTALCOST) : null,
        status:     RENTALSTATUS      || null,
        staffid:    STAFFID           ? Number(STAFFID) : null,
        id:         Number(id)
      },
      { autoCommit: true }
    );
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// DELETE RENTAL
exports.deleteRental = async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM RENTAL WHERE RENTALID = :id`,
      [id],
      { autoCommit: true }
    );
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

exports.getSimpleRental = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM RENTAL`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ rentals: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};