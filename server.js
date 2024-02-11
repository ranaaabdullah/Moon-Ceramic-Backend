const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const colors = require("colors");
const connectDb = require("./config/configdb");

//Body Parser
const app = express();
app.use(express.json());

//load env vars
dotenv.config({ path: "./config/config.env" });

//Connecting to Database
connectDb();

//logger parser
app.use(morgan("tiny"));

//CookieParser
app.use(cookieParser());

//route Files
const auth = require("./routes/auth");

//Mount routers
app.use("/api/v1/auth", auth);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server running on port ${PORT}`.yellow.bold));