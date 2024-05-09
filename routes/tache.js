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
    description,
    priorite,
    statut,
    dateDebut,
    dateFinPrevu,
    dateFinReel,
    projetId,
  } = req.body;
  const [rows] = await pool.query(
    "INSERT INTO Tache (description, priorite, statut, dateDebut, dateFinPrevu, dateFinReel, projetId) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
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

//route pour modifier une tache
router.put("/:id", async function (req, res, next) {
  const {
    description,
    priorite,
    statut,
    dateDebut,
    dateFinPrevu,
    dateFinReel,
    projetId,
  } = req.body;
  const [rows] = await pool.query(
    "UPDATE Tache SET description = ?, priorite = ?, statut = ?, dateDebut = ?, dateFinPrevu = ?, dateFinReel = ?, projetId = ? WHERE id = ?",
    [
      description,
      priorite,
      statut,
      dateDebut,
      dateFinPrevu,
      dateFinReel,
      projetId,
      req.params.id,
    ]
  );
  res.json(rows);
});

//route pour supprimer une tache
router.delete("/:id", async function (req, res, next) {
  const [rows] = await pool.query("DELETE FROM Tache WHERE id = ?", [
    req.params.id,
  ]);
  res.json(rows);
});

module.exports = router;
