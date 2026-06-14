const { getConnection } = require("../config/db.js");
const oracledb = require("oracledb");

// GET ALL COURSES (PAGINATED)
exports.getCourseList = async (req, res) => {
  let conn;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    conn = await getConnection();
    
    // Get total count for pagination calculation
    const countResult = await conn.execute(`SELECT COUNT(*) AS TOTAL FROM COURSE`);
    const totalRows = countResult.rows[0]?.TOTAL || countResult.rows[0]?.[0] || 0;

    const result = await conn.execute(
      `SELECT COURSE_ID, COURSE_NAME, DESCRIPTION, HOLES, DIFFICULTY_LEVEL 
       FROM COURSE 
       ORDER BY COURSE_ID DESC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({ 
      courses: result.rows,
      totalPages: Math.ceil(totalRows / limit) || 1
    });
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// CREATE COURSE
exports.createCourse = async (req, res) => {
  const { COURSE_NAME, DESCRIPTION, HOLES, DIFFICULTY_LEVEL } = req.body;
  let conn;
  try {
    conn = await getConnection();
    
    // Using 'b_' prefix for bind variables to avoid reserved word conflicts like 'DESC'
    const sql = `INSERT INTO COURSE (COURSE_NAME, DESCRIPTION, HOLES, DIFFICULTY_LEVEL)
                 VALUES (:b_name, :b_desc, :b_holes, :b_diff)`;
    
    const binds = {
      b_name: COURSE_NAME,
      b_desc: DESCRIPTION || null,
      b_holes: Number(HOLES),
      b_diff: DIFFICULTY_LEVEL
    };

    await conn.execute(sql, binds, { autoCommit: true });
    res.status(201).json({ message: "Course created successfully" });
  } catch (err) {
    console.error("Add Error:", err.message);
    res.status(500).json({ message: "Database rejected the add", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// UPDATE COURSE
exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { COURSE_NAME, DESCRIPTION, HOLES, DIFFICULTY_LEVEL } = req.body;
  let conn;
  try {
    conn = await getConnection();
    
    const sql = `UPDATE COURSE 
                 SET COURSE_NAME = :b_name, 
                     DESCRIPTION = :b_desc, 
                     HOLES = :b_holes, 
                     DIFFICULTY_LEVEL = :b_diff
                 WHERE COURSE_ID = :b_id`;
    
    const binds = {
      b_name: COURSE_NAME,
      b_desc: DESCRIPTION || null,
      b_holes: Number(HOLES),
      b_diff: DIFFICULTY_LEVEL,
      b_id: Number(id)
    };

    const result = await conn.execute(sql, binds, { autoCommit: true });
    
    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.json({ message: "Course updated successfully" });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ message: "Update failed", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

// DELETE COURSE
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await getConnection();
    
    const sql = `DELETE FROM COURSE WHERE COURSE_ID = :b_id`;
    
    await conn.execute(sql, { b_id: Number(id) }, { autoCommit: true });
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ message: "Delete failed", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};