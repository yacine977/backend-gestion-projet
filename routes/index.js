var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

//route bienvenue dans le backend
router.get("/", function (req, res, next) {
  res.send("Bienvenue dans le backend");
});

module.exports = router;
