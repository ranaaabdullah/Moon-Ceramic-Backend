const { Order } = require("../models/Order");
const { OrderItem } = require("../models/Orderitem");
const User = require("../models/User");

exports.GetOrders = async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
};

// Get a single order by its ID
exports.GetSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      });

    if (!order) {
      res.status(400).json({
        success: false,
        message: "Order not Found",
      });
    }
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ error: error, message: "Server Error" });
  }
};

// Create an new order
exports.CreateNewOrder = async (req, res) => {
  try {
    const existingOrder = Order.findOne({ _id: req.body._id });
    if (existingOrder)
      return res
        .status(400)
        .json({ message: "Order Already Created ", success: false });
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
      })
    );
    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          "product",
          "price"
        );
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
    const emailUser = req.body.email;
    const colors = req.body.color;

    console.log(colors);
    const user = await User.findOne({ email: emailUser });
    if (user) {
      let order = new Order({
        orderItems: orderItemsIdsResolved,
        streetAddress: req.body.streetAddress,
        paymentID: req.body.paymentID,
        fname: req.body.fname,
        lname: req.body.lname,
        city: req.body.city,
        company: req.body.company,
        state: req.body.state,
        email: req.body.email,
        Onote: req.body.Onote,
        color: req.body.color,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: user._id,
      });
      order = await order.save();

      if (!order)
        return res.status(400).json({
          success: false,
          message: "the order cannot be created!",
          statusCode: 400,
        });

      res.status(201).json({
        success: true,
        message: "the order is created succesfully",
        statusCode: 201,
        data: order,
      });
    }
  } catch (error) {
    res.json({ error: error, message: "Server error" }).status(500);
  }
};

// Update an order

exports.UpdateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );

    if (!order)
      return res
        .status(400)
        .json({ message: "the order cannot be update!", error: error });

    res
      .status(200)
      .json({ message: "order updated succesfully!", data: order });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error });
  }
};

exports.DeleteOrder = async (req, res) => {
  Order.findByIdAndDelete(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndDelete(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
};

exports.TotalSales = async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalsales: totalSales.pop().totalsales });
};

exports.GetTotalOrders = async (req, res) => {
  const orderCount = await Order.countDocuments();

  if (!orderCount) {
    res.status(200).json({ orderCount: 0 });
  }
  res.send({
    orderCount: orderCount,
  });
};

// exports.GetSingleOrder = async (req, res) => {
//   const userOrderList = await Order.find({ user: req.params.userid })
//     .populate({
//       path: "orderItems",
//       populate: {
//         path: "product",
//         populate: "category",
//       },
//     })
//     .sort({ dateOrdered: -1 });

//   if (!userOrderList) {
//     res.status(500).json({ success: false });
//   }
//   res.send(userOrderList);
// };
