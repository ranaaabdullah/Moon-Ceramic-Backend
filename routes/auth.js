const express = require("express");

const {
  register,
  login,
  updatePassword,
  updateUser,
  logout,
} = require("../controllers/auth");

// const propertyRouter = require("./property");

//Re-route into other routers

const router = express.Router();
// router.use("/:userId/properties", propertyRouter);
const { protect } = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/updateUser").put(updateUser);
router.route("/logout").post(logout);

module.exports = router;
