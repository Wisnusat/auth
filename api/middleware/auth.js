const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
var CryptoJS = require("crypto-js");

// Ambil config
const { secretKey } = require("../../config/config");

// Password encryption function
const encrypt = (nakedText) => {
  return CryptoJS.AES.encrypt(nakedText, secretKey).toString();
};

// Password decrypt function
const decrypt = (encryptedText) => {
  return CryptoJS.AES.decrypt(encryptedText, secretKey).toString(
    CryptoJS.enc.Utf8
  );
};

// Send mail function
const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "batarawisnu96@gmail.com",
    pass: "yzrnamzmqmrsfxhu",
  },
});

// call model
const user = require("../../models/index").user;
const { enc } = require("crypto-js/core");

// allow request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/login", async (req, res) => {
  // put data
  let data = {
    email: req.body.email,
    password: encrypt(req.body.password),
  };

  // put result
  let result = await user.findOne({ where: data });

  if (result === null) {
    res.json({
      message: "invalid username or password or level",
      isLogged: false,
    });
  } else {
    // jwt
    let jwtHeader = {
      algorithm: "HS256",
      // expiresIn: exp.expToken // 1s 1h 1d 1w 1y
    };

    let payload = {
      data: result,
    };

    let token = jwt.sign(payload, secretKey, jwtHeader);
    res.json({
      data: result,
      token: token,
      isLogged: true,
    });
  }
});

// Add data
app.post("/register", async (req, res) => {
  // Deklarasi semua variable dalam table database user
  let data = {
    name: req.body.name,
    email: req.body.email,
    password: encrypt(req.body.password),
  };

  user
    .create(data)
    .then((result) => {
      res.json({
        message: "Data inserted",
        isSuccess: true,
        data: result,
      });
    })
    .catch((error) => {
      res.json({
        message: error.message,
        isSuccess: false,
      });
    });
});

// forgot password
app.get("/forgot", async (req, res) => {
  // Deklarasi semua variable dalam table database user
  let data = {
    email: req.body.email,
  };

  // put result
  let result = await user.findOne({ where: data });

  if (result === null) {
    res.json({
      found: false,
      message: "User not found",
    });
  } else {
    res.json({
      found: true,
      password: decrypt(result.password),
    });

    // Declarate email details
    let mailDetails = {
      from: "batarawisnu96@gmail.com",
      to: data.email,
      subject: "Forgot Password",
      text: decrypt(result.password),
    };

    // Send email
    mailTransporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.log("Error Occurs");
      } else {
        console.log("Email sent successfully");
      }
    });
  }
});

module.exports = app;
