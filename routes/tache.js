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

router.post("/assigner", async function (req, res, next) {
  const { tacheId, uid, assignerId } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO assignationtache (tacheId, uid, assignerId) VALUES (?, ?, ?)",
      [tacheId, uid, assignerId]
    );

    // Créer une notification pour l'utilisateur à qui la tâche est assignée
    const notificationMessage = `Une nouvelle tâche vous a été assignée : Tâche ID ${tacheId}`;
    const notificationQuery = 'INSERT INTO notification (message, dateHeure, utilisateurId, isNew) VALUES (?, NOW(), ?, TRUE)';
    await pool.query(notificationQuery, [notificationMessage, uid]);

    res.json(result);
  } catch (err) {
    next(err);
  }
});





// Route pour obtenir la liste des tâches assignées à un utilisateur dans la base de données SQL

router.get("/par-utilisateur/:uid", async function (req, res, next) {
  const [rows] = await pool.query(
    "SELECT t.id, t.description, t.priorite, t.statut, t.dateDebut, t.dateFinPrevu, t.dateFinReel, t.projetId FROM Tache t JOIN assignationtache a ON t.id = a.tacheId WHERE a.uid = ?",
    [req.params.uid]
  );
  res.json(rows);
});

// Route pour obtenir la liste des tâches assignées à un utilisateur Firebase pour un projet spécifique
router.get("/par-utilisateur/:uid/projet/:projetId", async function (req, res, next) {
  const [rows] = await pool.query(
    "SELECT t.id, t.description, t.priorite, t.statut, t.dateDebut, t.dateFinPrevu, t.dateFinReel, t.projetId FROM Tache t JOIN assignationtache a ON t.id = a.tacheId WHERE a.uid = ? AND t.projetId = ?",
    [req.params.uid, req.params.projetId]
  );
  res.json(rows);
});

router.put("/terminer/:id", async function (req, res, next) {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "L'UID de l'utilisateur est requis" });
    }

    // Récupérer les informations de la tâche
    const [tacheRows] = await pool.query("SELECT * FROM Tache WHERE id = ?", [req.params.id]);
    const tache = tacheRows[0];
    if (!tache) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    // Récupérer l'assignerId depuis la table assignationtache
    const [assignationRows] = await pool.query("SELECT assignerId FROM assignationtache WHERE tacheId = ?", [req.params.id]);
    const assignerId = assignationRows[0]?.assignerId;
    if (!assignerId) {
      return res.status(404).json({ error: "Assigner non trouvé pour cette tâche" });
    }

    // Mettre à jour le statut de la tâche à "Terminée"
    await pool.query("UPDATE Tache SET statut = 'Terminée' WHERE id = ?", [req.params.id]);

    // Créer une notification pour l'utilisateur qui a assigné la tâche
    const notificationMessage = `La tâche ${tache.description} a été terminée par l'utilisateur ${uid}`;
    const notificationQuery = 'INSERT INTO notification (message, dateHeure, utilisateurId, isNew) VALUES (?, NOW(), ?, TRUE)';
    await pool.query(notificationQuery, [notificationMessage, assignerId]);

    res.json({ success: 'Tâche marquée comme terminée et notification créée' });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la tâche", err);
    next(err);
  }
});










module.exports = router;
