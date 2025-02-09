const Product = require("../services/productService");
const {
  findUserByEmail,
  checkVendorExists,
} = require("../services/userService");

// This API is used to create the products
// Only Admins, Vendors and Staffs can create the product
module.exports.create = async (req, res) => {
  try {
    // const productData = req.body;
    const productData = JSON.parse(req.body.data);
    const created_by = req.user.userEmail;
    const user_role = req.user.role;

    // Get image file buffer from multer
    const imageBuffer = req.file ? -req.file.buffer : null;

    // These are the madatory fields that needs to be given in request json, if any of
    // the below fields are null the product cannot be added.
    if (
      !productData.name ||
      !productData.category ||
      !productData.start_date ||
      !productData.old_price ||
      !productData.new_price ||
      !productData.vendor_id ||
      !imageBuffer
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    let staff;

    // Whenever the staff is trying to add the product he should have the assigned_vendor assignd to him
    // And also the assigned vendor should exists and the vendor id of the staff should match with the vendor id
    // given in the product input json
    if (user_role === "staff") {
      staff = await findUserByEmail(created_by);

      if (!staff.assigned_vendor) {
        return res
          .status(400)
          .json({ error: "Missing assigned vendor for " + created_by });
      } else {
        if (!(staff.assigned_vendor === productData.vendor_id)) {
          return res.status(400).json({
            error: `The given Vendor Id is not assigned to ${created_by}`,
          });
        }
      }
    } else {
      let vendor = await checkVendorExists(productData.vendor_id);

      if (!vendor) {
        return res
          .status(400)
          .json({ error: "The given Vendor Id doesnot exist!" });
      }
    }

    if (
      productData.old_price <= 0 ||
      productData.new_price < 0 ||
      productData.new_price > productData.old_price
    ) {
      return { error: "Invalid price values" };
    }

    // calculating the discount price
    let discount_price = (
      productData.old_price - productData.new_price
    ).toFixed(2);
    // calculating the discount percentage
    let discount_percentage = (
      (discount_price / productData.old_price) *
      100
    ).toFixed(2);

    await Product.createProduct(
      productData,
      created_by,
      discount_price,
      discount_percentage,
      imageBuffer
    );
    res
      .status(201)
      .json({ message: "Product added successfully", created_by: created_by });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error adding product" });
  }
};

// Products can be uiewed by all the authenticated users in the application with pagination implemented in it.
module.exports.view_products = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid page or limit values" });
    }
    let offset = Number((page - 1) * limit);

    const products = await Product.viewProducts(limit, offset);
    const formattedProducts = await products.map((product) => ({
      ...product,
      image_data: product.image_data
        ? `data:image/jpeg;base64,${Buffer.from(product.image_data).toString(
            "base64"
          )}`
        : null,
    }));
    res.status(200).json({ products: formattedProducts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// This API is used to search the products by using the keyword
// The keyword will be searched in product name, category and description of the product
module.exports.search_products = async (req, res) => {
  try {
    let { search, page, limit } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    let offset = Number((page - 1) * limit);
    const products = await Product.searchProducts(search, limit, offset);

    res.status(200).json({ products: products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
