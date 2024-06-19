var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

/**
 * Récupère toutes les réunions avec le nom du projet et le nom du créateur.
 */
router.get("/", async function (req, res, next) {
  const query = `
    SELECT reunion.*, projet.nom AS nomProjet, utilisateur.nom AS nomCreateur
    FROM reunion
    JOIN projet ON reunion.projetId = projet.id
    JOIN utilisateur ON reunion.createurId = utilisateur.utilisateurId
  `;
  try {
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la récupération des réunions");
  }
});

/**
 * Crée une nouvelle réunion pour un projet donné.
 */
router.post("/", async function (req, res) {
  const { sujet, dateTime, projetId, createurId } = req.body;

  try {
    const [results] = await pool.query(
      "INSERT INTO reunion (sujet, dateTime, projetId, createurId) VALUES (?, ?, ?, ?)",
      [sujet, dateTime, projetId, createurId]
    );

    res
      .status(201)
      .json({ id: results.insertId, sujet, dateTime, projetId, createurId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la création de la réunion");
  }
});

/**
 * Récupère une réunion par son ID.
 */
router.get("/:id", async function (req, res, next) {
  const [rows] = await pool.query("SELECT * FROM reunion WHERE id = ?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});

/**
 * Supprime une réunion par son ID.
 */
router.delete("/:id", async function (req, res, next) {
  const [rows] = await pool.query("DELETE FROM reunion WHERE id = ?", [
    req.params.id,
  ]);
  res.json(rows);
});

/**
 * Met à jour un ou plusieurs champs d'une réunion par son ID.
 */
router.put("/:id", async function (req, res, next) {
  const { sujet, dateTime, projetId, createurId } = req.body;

  // Récupère les données existantes
  const [existingData] = await pool.query(
    "SELECT * FROM reunion WHERE id = ?",
    [req.params.id]
  );

  // Si la réunion n'existe pas, retourne une erreur 404
  if (!existingData.length) {
    return res.status(404).json({ error: "Réunion non trouvée" });
  }

  // Met à jour les champs passés
  const newSujet = sujet || existingData[0].sujet;
  const newDateTime = dateTime || existingData[0].dateTime;
  const newProjetId = projetId || existingData[0].projetId;
  const newCreateurId = createurId || existingData[0].createurId;

  // Met à jour la base de données
  await pool.query(
    "UPDATE reunion SET sujet = ?, dateTime = ?, projetId = ?, createurId = ? WHERE id = ?",
    [newSujet, newDateTime, newProjetId, newCreateurId, req.params.id]
  );

  res.json({
    id: req.params.id,
    sujet: newSujet,
    dateTime: newDateTime,
    projetId: newProjetId,
    createurId: newCreateurId,
  });
});

/**
 * Récupère les réunions associées à un ID de projet spécifique.
 */
router.get("/par-projet/:projetId", async function (req, res, next) {
  const [rows] = await pool.query("SELECT * FROM reunion WHERE projetId = ?", [
    req.params.projetId,
  ]);
  res.json(rows);
});

//recuperer les reunions creer par un utilisateur pour un projet specifique
router.get("/par-projet/:projetId/:createurId", async function (req, res, next) {
  const [rows] = await pool.query("SELECT * FROM reunion WHERE projetId = ? AND createurId = ?", [
    req.params.projetId, req.params.createurId
  ]);
  res.json(rows);
});

// Ajoute un utulisateur firebase à une réunion
router.post("/ajouter-utilisateur", async function (req, res) {
  const { reunionId, utilisateurId } = req.body;
  try {
    const [results] = await pool.query(
      "INSERT INTO  participationreunion  (reunionId, utilisateurId) VALUES (?, ?)",
      [reunionId, utilisateurId]
    );

    res.status(201).json({ id: results.insertId, reunionId, utilisateurId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'ajout de l'utilisateur à la réunion");
  }
});




module.exports = router;
