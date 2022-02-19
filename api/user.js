const express = require("express");
const app = express();
var CryptoJS = require("crypto-js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ambil konfig
const { secretKey } = require("../config/config");

// Password Encryption dengan menggunakan library crypto-js
// Encrypt
const encrypt = (nakedText) => {
  return (hash = CryptoJS.HmacSHA256(nakedText, secretKey).toString());
};

// Panggil Model dari sequelize db:migrate
const user = require("../models/index").user;

// Berikan akses 'request-body'
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware, Autentikasi user
// const verify = require("./middleware/auth_verify");
// app.use(verify);

// config image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(null, "img-" + Date.now() + path.extname(file.originalname));
  },
});
let upload = multer({ storage: storage });

// Bagian CRUD [Create, Read, Update, Delete]
// Get data
app.get("/", async (req, res) => {
  user
    .findAll({ include: [{ all: true, nested: true }] })
    .then((result) => {
      res.json({
        data_user: result,
        found: true,
      });
    })
    .catch((error) => {
      res.json({
        message: error.message,
        found: false,
      });
    });
});

// Update data
app.put("/update-profile", upload.single("profile_image"), async (req, res) => {
  let data = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.password) {
    {
      data.password = encrypt(req.body.password);
    }
  }

  if (req.file) {
    {
      data.profile_image = req.file.filename;
    }
  }

  let id = {
    id: req.body.id,
  };

  // if (req.file) {
  //   // get data by id
  //   const row = await user.findOne({ where: id });
  //   let oldFileName = row.profile_image;

  //   if (oldFileName != null) {
  //     // delete old file
  //     let dir = path.join(__dirname, "../images", oldFileName);
  //     fs.unlink(dir, (err) => console.log(err));

  //     // set new filename
  //     data.profile_image = req.file.filename;
  //     console.log("function eliminated");
  //   }
  // }

  user
    .update(data, { where: id })
    .then((result) => {
      res.json({
        message: "Data updated",
        isSuccess: true,
      });
    })
    .catch((error) => {
      res.json({
        message: error.message,
        isSuccess: false,
      });
    });
});

// Delete data
app.delete("/delete/:id", async (req, res) => {
  let parameter = {
    id: req.params.id,
  };

  user
    .destroy({ where: parameter })
    .then((result) => {
      res.json({
        message: "Data deleted",
        isSuccess: true,
      });
    })
    .catch((error) => {
      res.json({
        message: error.message,
        isSuccess: false,
      });
    });
});

module.exports = app;
