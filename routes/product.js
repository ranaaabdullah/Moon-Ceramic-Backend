const express = require("express");
const {
  getAllProducts,
  createProduct,
  getProduct,
  UpdateProduct,
  DeleteProduct,
  ProductCount,
  Featured,
} = require("../controllers/product.js");

const router = express.Router({ mergeParams: true });

const advanceResults = require("../middleware/advanceResults.js");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/multer.js");

router
  .route("/")
  .get(getAllProducts)
  .post(upload.array("photos"), createProduct);

router.route("/getCount").get(ProductCount),
  router.route("/featured/:count").get(Featured),
  router
    .route("/:id")
    .get(getProduct)
    .put(upload.array("photos"), UpdateProduct)
    .delete(DeleteProduct);

module.exports = router;
