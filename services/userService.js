const db = require("../common/dbConnect");

const createUser = async (
  name,
  email,
  phone,
  password,
  role,
  assigned_vendor
) => {
  const user_sql = `INSERT INTO users (name,email,phone,password,role,assigned_vendor) VALUES (?,?,?,?,?,?)`;
  try {
    return db.execute(user_sql, [
      name,
      email,
      phone,
      password,
      role,
      assigned_vendor || null,
    ]);
  } catch (error) {
    console.error("Database Error:", error.message);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  const user_sql = `SELECT * FROM users WHERE email=?`;
  const [rows] = await db.execute(user_sql, [email]);
  return rows[0];
};

const findUserById = async (id) => {
  const user_sql = `SELECT * FROM users WHERE id=?`;
  const [rows] = await db.execute(user_sql, [id]);
  return rows[0];
};

const checkVendorExists = async (id) => {
  const user_sql = `SELECT * FROM users where id = ? and role = ?`;
  const [rows] = await db.execute(user_sql, [id, "vendor"]);
  return rows[0];
};
const createStaff = async (user_id, assigned_vendor) => {
  const staff_sql = `INSERT INTO staff (user_id,assigned_vendor) VALUES (?,?)`;
  try {
    return db.execute(staff_sql, [user_id, assigned_vendor || null]);
  } catch (error) {
    console.error("Database Error:", error.message);
    throw error;
  }
};

const updateUser = async (email, assigned_vendor) => {
  const user_sql = `UPDATE users SET assigned_vendor=? WHERE email=? AND role=? `;
  try {
    return db.execute(user_sql, [assigned_vendor || null, email, "staff"]);
  } catch (error) {
    console.error("Database Error:", error.message);
    throw error;
  }
};

const deleteUser = async (email) => {
  const user_sql = `DELETE from users WHERE email=?`;
  try {
    return db.execute(user_sql, [email]);
  } catch (error) {
    console.error("Database Error:", error.message);
    throw error;
  }
};

const viewMembers = async (limit, offset) => {
  const user_sql = `SELECT name,email,phone,role,assigned_vendor FROM users LIMIT ${limit}  OFFSET ${offset}`;

  console.log(limit, offset);
  const [rows] = await db.execute(user_sql, [limit, offset]);
  return rows;
};

module.exports = {
  createUser,
  findUserByEmail,
  createStaff,
  checkVendorExists,
  updateUser,
  deleteUser,
  viewMembers,
  findUserById,
};
