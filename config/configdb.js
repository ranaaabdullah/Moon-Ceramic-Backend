const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");


const connectDb = async () => {
  await mongoose
    .connect(process.env.DBURL)
    .then(() => console.log("MongoDb is connected"))
    .catch((err) => console.log(err, `Error`));
};

module.exports = connectDb;
