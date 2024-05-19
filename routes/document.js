var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

// route pour créer un nouveau document
router.post("/", async function (req, res, next) {
  const { nom, type, cheminAcces, utilisateurId } = req.body;
  const [rows] = await pool.query(
    "INSERT INTO document (nom, type, cheminAcces, utilisateurId) VALUES (?, ?, ?, ?)",
    [nom, type, cheminAcces, utilisateurId]
  );
  res
    .status(201)
    .json({ id: rows.insertId, nom, type, cheminAcces, utilisateurId });
});

//route get all documents
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("select * from document");
  res.json(rows);
});

module.exports = router;
