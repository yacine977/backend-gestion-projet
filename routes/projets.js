var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

//route get all projets
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("select * from projets");
  res.json(rows);
});

module.exports = router;
