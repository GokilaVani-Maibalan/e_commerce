const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authUser, authRole } = require("../common/authModule");

// Signup for the user
router.post("/signup", userController.signup);
// Login for the user
router.get("/login", userController.login);
// Update the staff with vendor id
router.put("/update", authUser, authRole(["admin"]), userController.update);
// Delete the staff
router.delete("/delete", authUser, authRole(["admin"]), userController.delete);
router.get(
  "/view_members",
  authUser,
  authRole(["admin"]),
  userController.view_members
);
module.exports = router;
