// Importation des modules nécessaires
var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();
const checkRole = require("./middleware");

// Route pour récupérer tous les projets sans restriction de rôle
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("SELECT * FROM projet");
  res.json(rows);
});

// Route pour créer un nouveau projet, accessible uniquement par le PDG
router.post("/", checkRole("PDG"), async function (req, res, next) {
  const { nom, description, dateDebut, dateFinPrevu, dateFinReel } = req.body;

  const [rows] = await pool.query(
    "INSERT INTO Projet (nom, description, dateDebut, dateFinPrevu, dateFinReel) VALUES (?, ?, ?, ?, ?)",
    [nom, description, dateDebut, dateFinPrevu, dateFinReel || null]
  );
  res.status(201).json(rows);
});

// Route pour récupérer un projet par son ID
router.get("/:id", async function (req, res, next) {
  const [rows] = await pool.query("SELECT * FROM projet WHERE id = ?", [
    req.params.id,
  ]);
  res.json(rows);
});

// Route pour mettre à jour un projet, accessible uniquement par le PDG
router.put("/:id", checkRole("PDG"), async function (req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM Projet WHERE id = ?", [
      req.params.id,
    ]);
    const oldData = rows[0];

    const newData = {
      ...oldData,
      ...req.body,
    };

    const [updateRows] = await pool.query(
      "UPDATE Projet SET nom = ?, description = ?, dateDebut = ?, dateFinPrevu = ?, dateFinReel = ? WHERE id = ?",
      [
        newData.nom,
        newData.description,
        newData.dateDebut,
        newData.dateFinPrevu,
        newData.dateFinReel,
        req.params.id,
      ]
    );
    res.json(updateRows);
  } catch (err) {
    next(err);
  }
});

// Route pour supprimer un projet, accessible uniquement par le PDG
router.delete("/:id", checkRole("PDG"), async function (req, res, next) {
  const [rows] = await pool.query("DELETE FROM Projet WHERE id = ?", [
    req.params.id,
  ]);
  res.json(rows);
});

// Route pour valider un projet, accessible uniquement par le PDG
router.put("/:id/valider", checkRole("PDG"), async function (req, res, next) {
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

// Route pour modifier le chef de projet, accessible uniquement par le PDG
router.put("/:id/chef", checkRole("PDG"), async function (req, res, next) {
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

// Route pour assigner des utilisateurs Firebase à un projet
router.post("/:id/assigner", async function (req, res, next) {
  const id = req.params.id;
  const uid = req.body.uid;
  try {
    const [results] = await pool.query(
      "INSERT INTO projet_utilisateur (id, uid) VALUES (?, ?)",
      [id, uid]
    );
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Route pour récupérer les noms des projets auxquels un utilisateur est assigné
router.get("/utilisateur/:uid", async function (req, res, next) {
  const uid = req.params.uid;
  try {
    const [rows] = await pool.query(
      "SELECT nom FROM projet WHERE id IN (SELECT id FROM projet_utilisateur WHERE uid = ?)",
      [uid]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Route pour afficher la liste des utilisateurs Firebase assignés à un projet
router.get("/:id/utilisateurs", async function (req, res, next) {
  const id = req.params.id;
  try {
    const [rows] = await pool.query(
      "SELECT uid FROM projet_utilisateur WHERE id = ?",
      [id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;