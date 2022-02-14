const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
var CryptoJS = require("crypto-js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ambil config
const { secretKey } = require("../../config/config");

//Token verification
const verify = require("./token_verify");

// Password encryption function
const encrypt = (nakedText) => {
  return (hash = CryptoJS.HmacSHA256(nakedText, secretKey).toString());
};

// Password decrypt function
// const decrypt = (encryptedText) => {
//   return CryptoJS.AES.decrypt(encryptedText, secretKey).toString(
//     CryptoJS.enc.Utf8
//   );
// };

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
      expiresIn: "1d",
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
  let data = {
    name: req.body.name,
    email: req.body.email,
    password: encrypt(req.body.password),
  };

  let email = {
    email: req.body.email,
  };

  const oldUser = await user.findOne({ where: email });

  if (oldUser) {
    return res.status(409).send("User Already Exist. Please Login");
  } else {
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
  }
});

// forgot password
app.post("/forgot", async (req, res) => {
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
    // jwt
    let jwtHeader = {
      algorithm: "HS256",
      expiresIn: "1d",
    };

    let payload = {
      data: result,
    };

    let token = jwt.sign(payload, secretKey, jwtHeader);
    res.json({
      // data: result,
      message: "User found",
      token: token,
    });

    // Declarate email details
    let mailDetails = {
      from: "batarawisnu96@gmail.com",
      to: data.email,
      subject: "Forgot Password",
      text: "https://markashosting.sosmed/" + token,
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

//Reset password
// app.put("/reset-password/:token", verify, async (req, res) => {
//   let data = {
//     password: encrypt(req.body.password),
//   };

//   let email = {
//     email: req.body.email,
//   };

//   user
//     .update(data, { where: email })
//     .then((result) => {
//       res.json({
//         message: "Data updated",
//         isSuccess: true,
//       });
//     })
//     .catch((error) => {
//       res.json({
//         message: error.message,
//         isSuccess: false,
//       });
//       console.log(token);
//     });
// });

module.exports = app;
