const { Product } = require("../models/Product");
const { Category } = require("../models/Category");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { json } = require("body-parser");

dotenv.config();

exports.getAllProducts = async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      res.status(500).json({ success: false, error: "No product found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Product Id is inValid" });
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    console.log(req.body);
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    const existingProduct = await Product.findOne({ name: req.body.name });
    if (existingProduct)
      return res
        .status(400)
        .json({ message: "Product already Created", success: false });

    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files;
      // Upload all images to Cloudinary and collect their URLs
      const imageUrls = [];
      for (let i = 0; i < uploadedImages.length; ++i) {
        const result = await cloudinary.uploader.upload(
          uploadedImages[i].path,
          {
            use_filename: true,
            folder: "imageUpload",
          }
        );
        imageUrls.push(result.secure_url);
      }
      // );

      if (imageUrls) {
        req.body.photos = imageUrls;
      }

      let product = new Product({
        name: req.body.name,
        description: req.body.description,
        photos: imageUrls,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        color: req.body.color.split(","),
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      });

      product = await product.save();

      if (!product)
        return res.status(500).json({
          success: false,
          message: "Product not created",
        });

      res.status(201).json({
        success: true,
        data: product,
        message: "Product Created Successfully",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.UpdateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const product1 = await Product.findById(req.params.id);
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files;
      // Upload all images to Cloudinary and collect their URLs
      for (let i = 0; i < uploadedImages.length; ++i) {
        const result = await cloudinary.uploader.upload(
          uploadedImages[i].path,
          {
            use_filename: true,
            folder: "imageUpload",
          }
        );
        imageUrls.push(result.secure_url);
      }
      // );
    }
    console.log(imageUrls);

    if (imageUrls.length > 0) {
      req.body.photos = imageUrls;
    } else {
      req.body.photos = product1.photos;
    }
    const productData = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id },
      productData,
      {
        new: true,
        //   // runValidators: true,
      }
    );

    if (!product)
      return res.status(500).json({
        success: false,
        message: "Product not updated",
      });
    return res.status(200).json({
      success: true,
      data: product,
      message: "the product is updated succesfully!",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.DeleteProduct = (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
};

exports.ProductCount = async (req, res) => {
  try {
    const productCount = await Product.countDocuments();

    if (!productCount) {
      res.status(500).json({ success: false });
    }
    res.status(200).json({ success: true, data: productCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error });
  }
};

exports.Featured = async (req, res) => {
  try {
    console.log("first");
    const count = req.params.count ? req.params.count : 1;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
      res.status(500).json({ success: false, message: "Product not found" });
    }
    res.send(products);
  } catch (error) {
    res.json({ error: error, message: "Error in processing the request" });
  }
};
