const { Product } = require("../models/Product");
const express = require("express");
const { Category } = require("../models/Category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

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

exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
};

exports.createProduct = async (req, res) => {
  try {
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

      console.log(imageUrls);

      if (imageUrls) {
        req.body.photos = imageUrls;
      }

      const category = await Category.findById(req.body.category);
      if (!category) return res.status(400).send("Invalid Category");

      let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        photos: imageUrls,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      });

      product = await product.save();

      if (!product)
        return res.status(500).send("The product cannot be created");

      res.send(product);
    }
  } catch (error) {}
};

exports.UpdateProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!product) return res.status(500).send("the product cannot be updated!");

  res.send(product);
};

exports.DeleteProduct = (req, res) => {
  Product.findByIdAndRemove(req.params.id)
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

// router.get(`/get/count`, async (req, res) => {
//   const productCount = await Product.countDocuments((count) => count);

//   if (!productCount) {
//     res.status(500).json({ success: false });
//   }
//   res.send({
//     productCount: productCount,
//   });
// });

// router.get(`/get/featured/:count`, async (req, res) => {
//   const count = req.params.count ? req.params.count : 0;
//   const products = await Product.find({ isFeatured: true }).limit(+count);

//   if (!products) {
//     res.status(500).json({ success: false });
//   }
//   res.send(products);
// });

exports.createProperty = async (req, res) => {
  console.log(req.files);
  const userId = req.body.seller;
  console.log(userId, "key userid");

  try {
    const file = req.files.file;

    // // Make sure the image is a photo
    // if (!file.mimetype.startsWith("image/png")) {
    //   return res.status(400).json({ message: "Please upload an image file" });
    // }

    // // Check filesize
    // if (file.size > process.env.MAX_FILE_UPLOAD) {
    //   return res
    //     .status(400)
    //     .json({
    //       message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
    //     });
    // }

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

      console.log(imageUrls);

      if (imageUrls) {
        req.body.photos = imageUrls;
      }

      //   // Create a new Property object and set its imageUrls property
      const propertyData = req.body;
      //   // Check if a Property with the same address already exists
      const existingProperty = await Property.findOne({
        address: propertyData.address,
      });

      if (existingProperty) {
        return res.status(400).json({ message: "Property already exists" });
      }

      const user = await User.findById(userId);

      propertyData.seller = user.toObject();
      propertyData.userId = userId;
      const property = await Property.create(propertyData);

      return res.status(201).json({
        success: true,
        message: "Property Registered Successfully",
        statusCode: 200,
        data: property, // You can also return the created property data if needed
      });
    } else {
      // Handle the case where no files were uploaded
      return res.status(400).json({ message: "No images uploaded" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ error: true, message: err.message, statusCode: 400 });
  }
};
