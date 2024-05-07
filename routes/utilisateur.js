var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

//get all users
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("select * from utilisateur");
  res.json(rows);
});

module.exports = router;
