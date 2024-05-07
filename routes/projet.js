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

// route pour valider un projet
router.put("/:id/valider", async function (req, res, next) {
  const id = req.params.id;
  try {
    const [results] = await pool.query(
      "UPDATE projet SET est_valide = TRUE WHERE id = ?",
      [id]
    );
    if (results.affectedRows === 0) {
      res.status(404).json({ message: "Projet non trouvé" });
    } else {
      res.json({ message: "Projet validé" });
    }
  } catch (err) {
    next(err);
  }
});

// route pour modifier le chef de projet d'un projet
router.put("/:id/chef", async function (req, res, next) {
  const id = req.params.id;
  const chefDeProjetId = req.body.chefDeProjetId;
  try {
    const [results] = await pool.query(
      "UPDATE projet SET chefDeProjetId = ? WHERE id = ?",
      [chefDeProjetId, id]
    );
    if (results.affectedRows === 0) {
      res.status(404).json({ message: "Projet non trouvé" });
    } else {
      res.json({ message: "Chef de projet modifié" });
    }
  } catch (err) {
    next(err);
  }
});
module.exports = router;
