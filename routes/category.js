const express = require("express");
const {
  getAllCategory,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category");

const router = express.Router({ mergeParams: true });

const advanceResults = require("../middleware/advanceResults.js");
const { protect, authorize } = require("../middleware/auth");


  router.route("/").get(getAllCategory).post(createCategory)

router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
