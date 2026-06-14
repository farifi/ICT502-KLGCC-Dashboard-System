const { getConnection } = require("../config/db.js");
const oracledb = require("oracledb");

// 1. function for Booking (Simple List for internal use)
exports.teeTimeList = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT TEE_TIME_ID, COURSE_ID, START_TIME, END_TIME, AVAILABLE_SLOTS FROM TEE_TIME`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({ teeTimes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// 2. Fetch Tee Times WITH Course Name for management table (WITH FORMATTING)
exports.teeTimeListWithCourse = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT 
          t.TEE_TIME_ID,
          t.COURSE_ID,
          c.COURSE_NAME,
          -- Display format for humans
          TO_CHAR(t.START_TIME, 'DD-MON-YYYY HH:MI AM') AS START_TIME_DISPLAY,
          TO_CHAR(t.END_TIME, 'DD-MON-YYYY HH:MI AM') AS END_TIME_DISPLAY,
          -- ISO format for HTML datetime-local input (Edit Form)
          TO_CHAR(t.START_TIME, 'YYYY-MM-DD"T"HH24:MI') AS START_TIME,
          TO_CHAR(t.END_TIME, 'YYYY-MM-DD"T"HH24:MI') AS END_TIME,
          t.AVAILABLE_SLOTS
       FROM TEE_TIME t
       JOIN COURSE c ON t.COURSE_ID = c.COURSE_ID
       ORDER BY t.START_TIME ASC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({ teeTimes: result.rows });
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// 3. Create Tee Time (Handles Identity and Timestamp string)
exports.createTeeTime = async (req, res) => {
  const { COURSE_ID, START_TIME, END_TIME, AVAILABLE_SLOTS } = req.body;
  let conn;
  try {
    conn = await getConnection();

    // No TEE_TIME_ID inserted because table is IDENTITY
    const sql = `INSERT INTO TEE_TIME (COURSE_ID, START_TIME, END_TIME, AVAILABLE_SLOTS)
                 VALUES (:b_course, 
                         TO_TIMESTAMP(:b_start, 'YYYY-MM-DD"T"HH24:MI'), 
                         TO_TIMESTAMP(:b_end, 'YYYY-MM-DD"T"HH24:MI'), 
                         :b_slots)`;
    
    const binds = {
      b_course: Number(COURSE_ID),
      b_start: START_TIME, 
      b_end: END_TIME,
      b_slots: Number(AVAILABLE_SLOTS)
    };

    await conn.execute(sql, binds, { autoCommit: true });
    res.status(201).json({ message: "Tee Time created successfully" });
  } catch (err) {
    console.error("Create Error:", err.message);
    res.status(500).json({ message: "Database rejected the add", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// 4. Update Tee Time
exports.updateTeeTime = async (req, res) => {
  const { id } = req.params;
  const { COURSE_ID, START_TIME, END_TIME, AVAILABLE_SLOTS } = req.body;
  let conn;
  try {
    conn = await getConnection();

    const sql = `UPDATE TEE_TIME
                 SET COURSE_ID = :b_course,
                     START_TIME = TO_TIMESTAMP(:b_start, 'YYYY-MM-DD"T"HH24:MI'),
                     END_TIME = TO_TIMESTAMP(:b_end, 'YYYY-MM-DD"T"HH24:MI'),
                     AVAILABLE_SLOTS = :b_slots
                 WHERE TEE_TIME_ID = :b_id`;
    
    const binds = {
      b_course: Number(COURSE_ID),
      b_start: START_TIME,
      b_end: END_TIME,
      b_slots: Number(AVAILABLE_SLOTS),
      b_id: Number(id)
    };

    const result = await conn.execute(sql, binds, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Tee Time not found" });
    }

    res.json({ message: "Tee Time updated successfully" });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ message: "Update failed", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// 5. Delete Tee Time
exports.deleteTeeTime = async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `DELETE FROM TEE_TIME WHERE TEE_TIME_ID = :b_id`, 
      { b_id: Number(id) }, 
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Tee Time not found" });
    }

    res.json({ message: "Tee Time deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ message: "Delete failed", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};