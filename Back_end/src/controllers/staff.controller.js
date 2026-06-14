const { getConnection } = require('../config/db.js');
const oracledb = require('oracledb');

exports.staffList = async (req, res) => {
    let conn;

    try {
        conn = await getConnection();

        const staffList = await conn.execute(
            `SELECT
                s.STAFF_ID,
                s.FULL_NAME AS STAFF_NAME,
                s.EMAIL,
                s.PHONE,
                s.SUPERVISOR_ID,
                sup.FULL_NAME AS SUPERVISOR_NAME
            FROM STAFF s
            LEFT JOIN STAFF sup
                ON s.SUPERVISOR_ID = sup.STAFF_ID
            ORDER BY s.STAFF_ID
            `, [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (staffList.rows.length === 0 ){
            return res.status(200).json({ message: "No record currently in the database"});
        }

        res.status(201).json({ staffs: staffList.rows });

    } catch (err) {
        console.error('Signup error:', err);
        if (!res.headerSent) {
            res.status(500).json({ message: "Server error", error: err.message });
        }
    } finally {
        if (conn) {
            try {
                await conn.close(); 
            } catch (err) {
                 console.error(err);
            }
        } 
    }
};

exports.createStaff = async (req, res) => {
    const { FULL_NAME, EMAIL, PHONE, SUPERVISOR_ID } = req.body;
    let conn;
  
    try {
      conn = await getConnection();
  
      const supervisorId =
        SUPERVISOR_ID ? Number(SUPERVISOR_ID) : null;
  
      const result = await conn.execute(
        `INSERT INTO STAFF (STAFF_ID, FULL_NAME, EMAIL, PHONE, SUPERVISOR_ID)
         VALUES (STAFF_SEQ.NEXTVAL, :name, :email, :phone, :supervisorId)
         RETURNING STAFF_ID INTO :id`,
        {
          name: FULL_NAME,
          email: EMAIL,
          phone: PHONE,
          supervisorId,
          id: { dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );
  
      const newStaffId = result.outBinds.id[0];
  
      const staff = await conn.execute(
        `SELECT
          s.STAFF_ID,
          s.FULL_NAME AS STAFF_NAME,
          s.EMAIL,
          s.PHONE,
          s.SUPERVISOR_ID,
          sup.FULL_NAME AS SUPERVISOR_NAME
        FROM STAFF s
        LEFT JOIN STAFF sup
          ON s.SUPERVISOR_ID = sup.STAFF_ID
        WHERE s.STAFF_ID = :id`,
        { id: newStaffId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      res.status(201).json({ staff: staff.rows[0] });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Server error",
        error: err.message
      });
    } finally {
      if (conn) await conn.close();
    }
  };
  
exports.deleteStaff = async (req, res) => {
    const { id } = req.params; 
    
    if (!id) return res.status(400).json({ message: 'Staff ID is required' });

    let conn;
    try {
        conn = await getConnection();
        result = await conn.execute(
            `DELETE FROM STAFF WHERE STAFF_ID = :id`,
            { id },
            { autoCommit: true }
        );

        console.log(result);

        if (result.rowsAffected === 0){
            return res.status(404).json({ message: 'Staff not found' });
        } 

        res.status(200).json({ message: "Staff deleted successfully"});
        
    } catch (error) {
        console.error('Signup error:', error);
        if (!res.headerSent) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    } finally {
        if (conn) {
            try {
                await conn.close(); 
            } catch (err) {
                 console.error(err);
            }
        } 
    }
};

exports.updateStaff = async (req, res) => {
    const { id } = req.params; 
    const { FULL_NAME, EMAIL, PHONE, SUPERVISOR_ID } = req.body;
    
    if (!id) return res.status(400).json({ message: 'Staff ID is required' });

    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `UPDATE STAFF SET FULL_NAME = :name, EMAIL = :email, 
            PHONE = :phone, SUPERVISOR_ID = :supervisorId
            WHERE STAFF_ID = :id`, 
            {name: FULL_NAME, email: EMAIL, phone: PHONE, supervisorId: SUPERVISOR_ID, id: id},
            {autoCommit: true}
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        res.status(200).json({ message: "Staff updated successfully" })
        
    } catch (error) {
        console.error('Signup error:', error);
        if (!res.headerSent) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    } finally {
        if (conn) {
            try {
                await conn.close(); 
            } catch (err) {
                 console.error(err);
            }
        } 
    }
};