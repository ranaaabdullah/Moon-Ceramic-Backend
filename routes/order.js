const express = require("express");
const {
  GetOrders,
  GetSingleOrder,
  CreateNewOrder,
  DeleteOrder,
  TotalSales,
  GetTotalOrders,
  UpdateOrder,
} = require("../controllers/orders");

const router = express.Router({ mergeParams: true });

// const advanceResults = require("../middleware/advanceResults.js");
// const { protect, authorize } = require("../middleware/auth");

router.route("/").get(GetOrders).post(CreateNewOrder);
router.route("/sales").get(TotalSales);
router.route("/orderCount").get(GetTotalOrders);

router.route("/:id").get(GetSingleOrder).put(UpdateOrder).delete(DeleteOrder);

module.exports = router;
