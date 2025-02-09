const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authUser, authRole } = require("../common/authModule");
// To upload the image of the product while adding the product
const { upload } = require("../services/productService");

// Adding the product
router.post(
  "/create",
  authUser,
  authRole(["vendor", "admin", "staff"]),
  upload.single("image"),
  productController.create
);
// Viewing the product
router.get("/view", authUser, productController.view_products);
// Search for the product
router.get("/search", authUser, productController.search_products);
module.exports = router;
