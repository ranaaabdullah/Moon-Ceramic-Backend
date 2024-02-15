const { Category } = require("../models/Category");
const express = require("express");

exports.getAllCategory = async (req, res, next) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false, message: "No categories found" });
  }
  res.status(200).json({
    success: true,
    data: categoryList,
  });
};

exports.getCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res
      .status(500)
      .json({ message: "The category with the given ID was not found." });
  }
  res.status(200).json({
    success: true,
    data: category,
  });
};

exports.createCategory = async (req, res) => {
  let category = new Category({
    name: req.body.name,
  });
  category = await category.save();

  if (!category) return res.status(400).send("the category cannot be created!");

  res.send(category);
};

exports.updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      color: req.body.color,
    },
    { new: true }
  );

  if (!category)
    return res
      .status(400)
      .json({ error: true, message: "Category not updated", statusCode: 400 });

  res
    .status(200)
    .json({ data: category, message: "Category updated", statusCode: 200 });
};

exports.deleteCategory = (req, res) => {
  Category.findByIdAndDelete(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "the category is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "category not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
};
