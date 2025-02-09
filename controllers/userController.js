const bcrypt = require("bcryptjs");
const User = require("../services/userService");
const jwt = require("jsonwebtoken");

// This api is used to create user, staff, admin and vendor
module.exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, role, assigned_vendor } = req.body;

    if (!["user", "vendor", "admin", "staff"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // If role is staff from the json body, then as per the requirement the staff should only be added by the admin
    // So we are validating the admin provision in below if condition to ensure that the staff has been added by the admin
    if (role === "staff") {
      const token = req.header("Authorization");
      if (!token) return res.status(401).json({ error: "Access Denied" });
      let userRole = undefined;
      try {
        const verified = jwt.verify(
          token.split(" ")[1],
          process.env.JWT_SECRET
        );
        userRole = verified.role;
      } catch (error) {
        res.status(400).json({ error: "Invalid Token" });
      }
      if (userRole === "admin") {
        const hashedPassword = await bcrypt.hash(password, 10);
        // If it's staff then he needs to be assigned under vendor, if there is no assigned vendor, still we can create the staff and
        // later we can update the assigned_vendor using PUT call
        if (assigned_vendor) {
          const vendor = await User.checkVendorExists(assigned_vendor);
          if (!vendor) {
            res.status(403).json({ message: "The vendor does not exists" });
          } else {
            await User.createUser(
              name,
              email,
              phone,
              hashedPassword,
              role,
              assigned_vendor
            );
            res
              .status(200)
              .json({ message: "Staff user Signup successfully!" });
          }
        } else {
          // This is used to create the staff if the assigned_vendor is not given in input body request
          await User.createUser(
            name,
            email,
            phone,
            hashedPassword,
            role,
            assigned_vendor
          );
          res.status(200).json({ message: "Staff user Signup successfully!" });
        }
      }
    } else {
      // This is for creating the user, admin and vendor
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.createUser(name, email, phone, hashedPassword, role || "user");
      res.status(200).json({ message: `${name} Signup successful!` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// This module will return the jwt token for the authenticated user
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { userName: user.name, role: user.role, userEmail: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// This API call is used to update the assigned_vendor to the staff. assigned vendor is taken from the query param
module.exports.update = async (req, res) => {
  try {
    const { email } = req.body;

    const assigned_vendor = req.query.assigned_vendor;
    if (assigned_vendor) {
      const vendor = await User.checkVendorExists(assigned_vendor);
      if (!vendor) {
        res.status(403).json({ message: "The vendor does not exists" });
      } else {
        await User.updateUser(email, assigned_vendor);

        res.status(200).json({ message: "Vendor assigned successfully!" });
      }
    } else {
      res
        .status(403)
        .json({ message: "Must have assigned_vendor in query param" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// API to Delete the staff by only Admins
module.exports.delete = async (req, res) => {
  try {
    const { email } = req.body;
    const token = req.header("Authorization");

    const staff = await User.findUserByEmail(email);

    if (staff.role === "staff") {
      await User.deleteUser(email);

      res.status(200).json({ message: "User Deleted successfully!" });
    } else {
      res.status(403).json({
        message: "Admin have no access to delete other than Staff",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// This API is t view all the users by Admin with Pagination implementation
module.exports.view_members = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid page or limit values" });
    }
    let offset = Number((page - 1) * limit);

    const members = await User.viewMembers(limit, offset);
    res.status(200).json({ members: members });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
