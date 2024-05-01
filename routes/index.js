var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

/* GET home page. */
router.get("/utilisateurs", async function (req, res, next) {
  const [rows] = await pool.query("select * from utilisateurs");
  res.json(rows);
});

module.exports = router;
