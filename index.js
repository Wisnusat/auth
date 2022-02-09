const express = require("express");
const app = express();
var cors = require("cors");

// Ambil konfig
const { port } = require("./config/config");

// CORS is a mechanism that allows restricted resources on a web page
// to be requested from another domain outside the domain from which
// the first resource was served
app.use(cors());
app.use(express.static(__dirname));

// Middleware
const auth = require("./api/middleware/auth");

// Deklarasi API
const user = require("./api/user");

// Gunakan API
app.use("/api/user", user);
app.use("/api/auth", auth);

// Server
app.listen(port, () => {
  console.log("server run in port: " + port);
});
