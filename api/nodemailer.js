const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "batarawisnu96@gmail.com",
    pass: "yzrnamzmqmrsfxhu",
  },
});

let mailDetails = {
  from: "batarawisnu96@gmail.com",
  to: "onespotify105@gmail.com",
  subject: "Test mail",
  text: "Node.js testing mail for GeeksforGeeks",
};

mailTransporter.sendMail(mailDetails, function (err, data) {
  if (err) {
    console.log(err);
  } else {
    console.log("Email sent successfully");
  }
});
