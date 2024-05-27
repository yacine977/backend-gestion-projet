var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

// route pour recupérer toutes les réunions
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("select * from reunion");
  res.json(rows);
});

module.exports = router;
