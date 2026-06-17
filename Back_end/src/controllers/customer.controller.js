const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

// =============================
// Get Customers (Paginated)
// =============================
exports.customerListPaged = async (req, res) => {
let conn;

const { page = 1, limit = 5 } = req.query;

const pageNum = parseInt(page);
const limitNum = parseInt(limit);

const offset = (pageNum - 1) * limitNum;

try {
conn = await getConnection();

const countResult = await conn.execute(
  `SELECT COUNT(*) TOTAL FROM CUSTOMER`,
  [],
  { outFormat: oracledb.OUT_FORMAT_OBJECT }
);

const totalRows = countResult.rows[0].TOTAL;
const totalPages = Math.ceil(totalRows / limitNum);

const result = await conn.execute(
  `
  SELECT
    CUSTID,
    CUSTNAME,
    CUSTPHONENUM,
    CUSTIC,
    CUSTEMAIL,
    CUSTLICENSENO,
    CUSTADDRESS
  FROM CUSTOMER
  ORDER BY CUSTID
  OFFSET :offset ROWS
  FETCH NEXT :limit ROWS ONLY
  `,
  {
    offset,
    limit: limitNum
  },
  {
    outFormat: oracledb.OUT_FORMAT_OBJECT
  }
);

res.status(200).json({
  customers: result.rows,
  totalPages
});

} catch (err) {
console.error(err);

res.status(500).json({
  message: "Failed to fetch customers"
});

} finally {
if (conn) await conn.close();
}
};

// =============================
// Add Customer
// =============================
exports.addCustomer = async (req, res) => {
let conn;

const {
CUSTNAME,
CUSTPHONENUM,
CUSTIC,
CUSTEMAIL,
CUSTLICENSENO,
CUSTADDRESS,
CUSTPASSWORD
} = req.body;

try {
conn = await getConnection();

await conn.execute(
  `
  INSERT INTO CUSTOMER (
  CUSTID,
  CUSTNAME,
  CUSTPHONENUM,
  CUSTIC,
  CUSTEMAIL,
  CUSTLICENSENO,
  CUSTADDRESS,
  CUSTPASSWORD
)
VALUES (
  CUSTOMER_SEQ.NEXTVAL,
  :CUSTNAME,
  :CUSTPHONENUM,
  :CUSTIC,
  :CUSTEMAIL,
  :CUSTLICENSENO,
  :CUSTADDRESS,
  :CUSTPASSWORD
)
  `,
  {
    CUSTNAME,
    CUSTPHONENUM,
    CUSTIC,
    CUSTEMAIL,
    CUSTLICENSENO,
    CUSTADDRESS,
    CUSTPASSWORD
  },
  {
    autoCommit: true
  }
);

res.status(201).json({
  message: "Customer created successfully"
});

} catch (err) {
console.error(err);

res.status(500).json({
  message: err.message
});

} finally {
if (conn) await conn.close();
}
};

// =============================
// Update Customer
// =============================
exports.updateCustomer = async (req, res) => {
let conn;

const { id } = req.params;

const {
CUSTNAME,
CUSTPHONENUM,
CUSTIC,
CUSTEMAIL,
CUSTLICENSENO,
CUSTADDRESS
} = req.body;

try {
conn = await getConnection();

await conn.execute(
  `
  UPDATE CUSTOMER
  SET
    CUSTNAME = :CUSTNAME,
    CUSTPHONENUM = :CUSTPHONENUM,
    CUSTIC = :CUSTIC,
    CUSTEMAIL = :CUSTEMAIL,
    CUSTLICENSENO = :CUSTLICENSENO,
    CUSTADDRESS = :CUSTADDRESS
  WHERE CUSTID = :id
  `,
  {
    CUSTNAME,
    CUSTPHONENUM,
    CUSTIC,
    CUSTEMAIL,
    CUSTLICENSENO,
    CUSTADDRESS,
    id
  },
  {
    autoCommit: true
  }
);

res.status(200).json({
  message: "Customer updated successfully"
});

} catch (err) {
console.error(err);

res.status(500).json({
  message: err.message
});

} finally {
if (conn) await conn.close();
}
};

// =============================
// Delete Customer
// =============================
exports.deleteCustomer = async (req, res) => {
let conn;

const { id } = req.params;

try {
conn = await getConnection();

await conn.execute(
  `DELETE FROM CUSTOMER WHERE CUSTID = :id`,
  { id },
  { autoCommit: true }
);

res.status(200).json({
  message: "Customer deleted successfully"
});

} catch (err) {
console.error(err);

res.status(500).json({
  message: err.message
});

} finally {
if (conn) await conn.close();
}
};
