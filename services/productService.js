const db = require("../common/dbConnect");
const slugify = require("slugify");
const multer = require("multer");
const path = require("path");

// File Upload Middleware
// Store image in memory as a buffer
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

const createProduct = async (
  productData,
  created_by,
  discount_price,
  discount_percentage,
  imageBuffer
) => {
  const {
    name,
    description,
    category,
    start_date,
    free_delivery,
    delivery_fee,

    old_price,
    new_price,
    vendor_id,
  } = productData;
  const product_url = await generateUniqueSlug(name);
  const product_sql = `INSERT INTO products (name,
   description,
    category, 
    start_date,
     free_delivery, 
     delivery_fee, 
     image_data,
     product_url, 
     old_price, 
     new_price, 
     discount_price, 
     discount_percentage,
      vendor_id,
      created_by)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`;
  return db.execute(product_sql, [
    name,
    description || null,
    category,
    start_date,
    free_delivery || null,
    delivery_fee || null,
    imageBuffer,
    product_url,
    old_price,
    new_price,
    discount_price || null,
    discount_percentage || null,
    vendor_id,
    created_by,
  ]);
};

const generateUniqueSlug = async (productName) => {
  // Convert product name to lowercase, remove special characters, and replace spaces with dashes
  let slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-"); // Replace spaces with dashes

  let uniqueSlug = `${slug}-${Date.now()}`;

  return uniqueSlug;
};

const viewProducts = async (limit, offset) => {
  const product_sql = `SELECT 
  products.name,
  products.description,
  products.category,
  products.start_date,
  products.expiry_date,
  products.old_price,
  products.new_price,
  products.discount_price,
  products.discount_percentage,
  products.free_delivery,
  products.delivery_fee,
  products.product_url,
  products.image_data,
  users.name AS vendor_name,
  users.email AS vendor_email
      
    FROM products JOIN users ON products.vendor_id = users.id LIMIT ${limit}  OFFSET ${offset}`;

  const [rows] = await db.execute(product_sql, [limit, offset]);
  return rows;
};

const searchProducts = async (search, limit, offset) => {
  const searchValue = `%${search}%`;
  const limitVal = `${limit}`;
  const offsetVal = `${offset}`;
  const product_sql = `SELECT 
    products.name,
    products.description,
    products.category,
    products.start_date,
    products.expiry_date,
    products.old_price,
    products.new_price,
    products.discount_price,
    products.discount_percentage,
    products.free_delivery,
    products.delivery_fee,
    products.product_url,
    products.image_data,
      users.name AS vendor_name,
        users.email AS vendor_email
        
      FROM products JOIN users ON products.vendor_id = users.id WHERE products.name LIKE ? OR products.description  LIKE ? OR products.category LIKE ?  LIMIT ?  OFFSET ?`;

  const [rows] = await db.execute(product_sql, [
    searchValue,
    searchValue,
    searchValue,
    limitVal,
    offsetVal,
  ]);
  return rows;
};
module.exports = {
  createProduct,
  generateUniqueSlug,
  viewProducts,
  searchProducts,
  upload,
};
