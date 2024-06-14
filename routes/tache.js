var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

// Route pour récupérer toutes les tâches
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("SELECT * FROM tache");
  res.json(rows);
});

// Route pour récupérer une tâche par son ID
router.get("/:id", async function (req, res, next) {
  const [rows] = await pool.query("SELECT * FROM tache WHERE id = ?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});

// Route pour créer une nouvelle tâche
router.post("/", async function (req, res, next) {
  const { description, priorite, statut, dateDebut, dateFinPrevu, projetId } =
    req.body;
  let { dateFinReel } = req.body;

  // Si dateFinReel n'est pas fournie, la définir sur null
  if (!dateFinReel) {
    dateFinReel = null;
  }

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

// Route pour modifier une tâche existante
router.put("/:id", async function (req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM Tache WHERE id = ?", [
      req.params.id,
    ]);
    const oldData = rows[0];

    // Fusionner les données existantes avec les nouvelles valeurs fournies
    const newData = { ...oldData, ...req.body };

    // Si dateFinReel n'est pas fournie dans les nouvelles valeurs, la définir sur null
    if (!newData.dateFinReel) {
      newData.dateFinReel = null;
    }

    const [updateRows] = await pool.query(
      "UPDATE Tache SET description = ?, priorite = ?, statut = ?, dateDebut = ?, dateFinPrevu = ?, dateFinReel = ?, projetId = ? WHERE id = ?",
      [
        newData.description,
        newData.priorite,
        newData.statut,
        newData.dateDebut,
        newData.dateFinPrevu,
        newData.dateFinReel,
        newData.projetId,
        req.params.id,
      ]
    );
    res.json(updateRows);
  } catch (err) {
    next(err);
  }
});

// Route pour supprimer une tâche
router.delete("/:id", async function (req, res, next) {
  const [rows] = await pool.query("DELETE FROM Tache WHERE id = ?", [
    req.params.id,
  ]);
  res.json(rows);
});

// Route pour récupérer les tâches d'un projet spécifique
router.get("/projet/:projetId", async function (req, res, next) {
  const [rows] = await pool.query("SELECT * FROM Tache WHERE projetId = ?", [
    req.params.projetId,
  ]);
  res.json(rows);
});

// Route pour assigner des tâches à un utilisateur Firebase
router.post("/assigner", async function (req, res, next) {
  const { tacheId, uid } = req.body;

  const [rows] = await pool.query(
    "INSERT INTO assignationtache (tacheId, uid) VALUES (?, ?)",
    [tacheId, uid]
  );
  res.json(rows);
});

// Route pour obtenir la liste des tâches assignées à un utilisateur Firebase
router.get("/par-utilisateur/:uid", async function (req, res, next) {
  const uid = req.params.uid;

  try {
    const [rows] = await pool.query(
      "SELECT tacheId FROM assignationtache WHERE uid = ?",
      [uid]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
