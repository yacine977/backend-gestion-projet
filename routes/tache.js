var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

//route get all taches
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("select * from tache");
  res.json(rows);
});

//route get tache by id
router.get("/:id", async function (req, res, next) {
  const [rows] = await pool.query("select * from tache where id = ?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});

// route pour créer une tâche
router.post("/", async function (req, res, next) {
  const { description, priorite, statut, dateDebut, dateFinPrevu, projetId } =
    req.body;

  let { dateFinReel } = req.body;

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

//route pour modifier une tache
router.put("/:id", async function (req, res, next) {
  try {
    // Récupérer l'objet existant
    const [rows] = await pool.query("SELECT * FROM Tache WHERE id = ?", [
      req.params.id,
    ]);
    const oldData = rows[0];

    // Fusionner les anciennes et les nouvelles valeurs
    const newData = {
      ...oldData,
      ...req.body,
    };

    // Si dateFinReel n'est pas fournie, la définir sur null
    if (!newData.dateFinReel) {
      newData.dateFinReel = null;
    }

    // Effectuer la mise à jour
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

//route pour supprimer une tache
router.delete("/:id", async function (req, res, next) {
  const [rows] = await pool.query("DELETE FROM Tache WHERE id = ?", [
    req.params.id,
  ]);
  res.json(rows);
});

//route pour récupérer les tâches d'un projet spécifique
router.get("/projet/:projetId", async function (req, res, next) {
  const [rows] = await pool.query("SELECT * FROM Tache WHERE projetId = ?", [
    req.params.projetId,
  ]);
  res.json(rows);
});

module.exports = router;
