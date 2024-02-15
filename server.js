const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const colors = require("colors");
const connectDb = require("./config/configdb");
const cloudinary = require("cloudinary").v2;

//Body Parser
const app = express();
app.use(express.json());

//load env vars
dotenv.config();

//Connecting to Database
connectDb();

//logger parser
app.use(morgan("tiny"));

//CookieParser
app.use(cookieParser());

//route Files
const auth = require("./routes/auth");
const category = require("./routes/category");
const product = require("./routes/product");
const order = require("./routes/order");

//Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/category", category);
app.use("/api/v1/product", product);
app.use("/api/v1/order", order);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server running on port ${PORT}`.yellow.bold));
