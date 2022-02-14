const jwt = require("jsonwebtoken");
const { secretKey } = require("../../config/config");

token_verify = (req, res, next) => {
  // get jwt from header
  let header = req.params.token;
  let token = null;

  if (header != null) {
    // get token from second side
    token = header.split(" ")[1];
  }

  if (token === null) {
    res.json({
      message: "Unauthorized",
    });
    console.log(token);
  } else {
    // jwt
    let jwtHeader = {
      algorithm: "HS256",
    };

    jwt.verify(token, secretKey, jwtHeader, (err) => {
      if (err) {
        res.json({
          message: "Invalid or expired token",
          Token: token,
        });
      } else {
        next();
      }
    });
  }
};

module.exports = token_verify;
