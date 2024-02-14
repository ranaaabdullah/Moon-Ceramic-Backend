import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { response } from "express";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(res.url);
    return res
  } catch (error) {
    fs.unlinkSync (localFilePath)
    return null
  }
};


export {uploadCloudinary}