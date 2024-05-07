var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

//route get all projets
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("select * from projet");
  res.json(rows);
});

//route create new projet
router.post("/", async function (req, res, next) {
  const {
    nom,
    description,
    dateDebut,
    dateFinPrevu,
    dateFinReel,
    chefDeProjetId,
  } = req.body;
  const [rows] = await pool.query(
    "INSERT INTO Projet (nom, description, dateDebut, dateFinPrevu, dateFinReel, chefDeProjetId) VALUES (?, ?, ?, ?, ?, ?)",
    [nom, description, dateDebut, dateFinPrevu, dateFinReel, chefDeProjetId]
  );
  res.status(201).json(rows);
});

//route get projet by id
router.get("/:id", async function (req, res, next) {
  const [rows] = await pool.query("select * from projet where id = ?", [
    req.params.id,
  ]);
  res.json(rows);
});

//route pour update projet
router.put("/:id", async function (req, res, next) {
  const {
    nom,
    description,
    dateDebut,
    dateFinPrevu,
    dateFinReel,
    chefDeProjetId,
  } = req.body;
  const [rows] = await pool.query(
    "UPDATE Projet SET nom = ?, description = ?, dateDebut = ?, dateFinPrevu = ?, dateFinReel = ?, chefDeProjetId = ? WHERE id = ?",
    [
      nom,
      description,
      dateDebut,
      dateFinPrevu,
      dateFinReel,
      chefDeProjetId,
      req.params.id,
    ]
  );
  res.json(rows);
});

//route pour delete projet
router.delete("/:id", async function (req, res, next) {
  const [rows] = await pool.query("DELETE FROM Projet WHERE id = ?", [
    req.params.id,
  ]);
  res.json(rows);
});

module.exports = router;
