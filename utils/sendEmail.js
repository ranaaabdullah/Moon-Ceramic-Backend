const nodemailer = require("nodemailer");
const dotenv = require("dotenv");



//load env vars
dotenv.config({ path: "./config/config.env" });


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass:process.env.SMTP_PASSWORD
    }
});

const sendEmail = async(options) =>{
  // send mail with defined transport object
  const message ={
    from: "rana.abdullah3655@gmail.com", // sender address
    to: options.email, // list of receivers
    subject:options.subject, // Subject line
    text: options.message, // plain text body
  };

  const info = await transporter.sendMail(message)

  console.log('Message sent: %s', info.messageId)

}

module.exports=sendEmail