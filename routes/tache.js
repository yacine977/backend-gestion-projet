var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

//route get all taches
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("select * from tache");
  res.json(rows);
});

// route pour cree une tache
router.post("/", async function (req, res, next) {
  const {
    id,
    description,
    priorite,
    statut,
    dateDebut,
    dateFinPrevu,
    dateFinReel,
    projetId,
  } = req.body;
  const [rows] = await pool.query(
    "INSERT INTO Tache (id, description, priorite, statut, dateDebut, dateFinPrevu, dateFinReel, projetId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      description,
      priorite,
      statut,
      dateDebut,
      dateFinPrevu,
      dateFinReel,
      projetId,
    ]
  );
  res.json(rows);
});

module.exports = router;
