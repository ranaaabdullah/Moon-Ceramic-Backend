const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const otpGenerator = require("otp-generator");
const { VirtualType } = require("mongoose");

//@desc Register User
//@route POST/api/v1/auth/register
//@access public

exports.register = async (req, res) => {
  try {
    // Add user to database
    const { name, email, password, number } = req.body;
    console.log(req.body);
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exist" });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      number,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ error: true, message: error, statusCode: 400 });
  }
};
//@desc Login User
//@route POST/api/v1/auth/login
//@access public

exports.login = async (req, res) => {
  try {
    //Add user to database
    const { email, password } = req.body;
    //Validate Email & Password
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide an email and passowrd" });
    }

    //Check for User
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "User does not exists" });
    }

    //check for passowrd match
    const isMAtch = await user.matchPassword(password);

    if (!isMAtch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    sendTokenResponse(user, 200, res);
    console.log(user, "userrr????");
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ error: true, message: error, statusCode: 400 });
  }
};

//@desc Update User
//@route POST/api/v1/auth/me
//@access Private
exports.updateUser = async (req, res) => {
  const { email, name, password, number } = req.body;
  console.log("BODY REQ:: ", email, password, number, name);

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .json({ error: true, message: "Cannot find user", statusCode: 400 });
  }

  user.name = name;
  user.number -= number;
  if (password) {
    user.password = password;
  }
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
    message: "User profile has been updated successfully",
  });
};

// //@desc Forgot Passowrd
// //@route POST/api/v1/auth/forgetpassowrd
// //@access Private
// exports.forgotPasswordLink = asyncHandler(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });
//   console.log(req.body.email);
//   if (!user) {
//     // return next(new ErrorResponse("There is no user with that email", 404));
//     return res.status(401).json({ message: "User does not exists" });
//   }
//   //Generate OTP
//   const otpPassword = otpGenerator.generate(4, {
//     upperCaseAlphabets: false,
//     lowerCaseAlphabets: false,
//     specialChars: false,
//   });

//   user.otp = otpPassword;
//   user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;
//   //send email
//   const message = `Your OTP for Reset Password is ${otpPassword}`;
//   try {
//     await sendEmail({
//       email: req.body.email,
//       subject: "One time password for verification",
//       message,
//     });

//     res.status(200).json({
//       message: "An email has been sent for with otp to your registered email",
//       success: true,
//       statusCode: 200,
//     });
//   } catch (error) {
//     console.log(error);
//     user.resetPasswordOtp = undefined;
//     user.resetPasswordOtpExpire = undefined;
//   }
//   await user.save({ validateBeforeSave: false });
//   return res.status(500).json({ message: "Email could not be sent" });
// });

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { email, updatePassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(400)
      .json({ message: "User does not exists", error: true, statusCode: 400 });
  }

  // Set new password
  user.password = updatePassword;
  await user.save();

  res.status(200).json({
    message: "Password has been changed successfully",
    success: true,
    statusCode: 200,
  });
});

//@desc log user out/clear cookies
//@route GEt/api/v1/auth/logout
//@access Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httponly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

//Get token from model , Create cookie and send response'
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJWTToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 27 * 60 * 60 * 1000
    ),
    httponly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  const { name, email, number } = user;
  console.log({ user });
  const data = { name, email, number };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token, data, statusCode: statusCode });
};
