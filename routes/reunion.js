var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

// route pour récupérer toutes les réunions avec le nom du projet et le nom du créateur
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

//route pour créer une nouvelle réunion pour un projet donné
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

//route pour récupérer une réunion par son ID
router.get("/:id", async function (req, res, next) {
  const [rows] = await pool.query("select * from reunion where id = ?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});

//route pour supprimer une réunion par son ID
router.delete("/:id", async function (req, res, next) {
  const [rows] = await pool.query("delete from reunion where id = ?", [
    req.params.id,
  ]);
  res.json(rows);
});

//route pour mettre à jour un ou plusieurs champs d'une réunion par son ID
router.put("/:id", async function (req, res, next) {
  const { sujet, dateTime, projetId, createurId } = req.body;

  // First, retrieve the existing data
  const [existingData] = await pool.query(
    "SELECT * FROM reunion WHERE id = ?",
    [req.params.id]
  );

  // If the reunion doesn't exist, return a 404 error
  if (!existingData.length) {
    return res.status(404).json({ error: "Réunion non trouvée" });
  }

  // Update the fields that were passed
  const newSujet = sujet || existingData[0].sujet;
  const newDateTime = dateTime || existingData[0].dateTime;
  const newProjetId = projetId || existingData[0].projetId;
  const newCreateurId = createurId || existingData[0].createurId;

  // Update the database
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

//route pour récupérer les réunions associées à un ID de projet spécifique
router.get("/par-projet/:projetId", async function (req, res, next) {
  const [rows] = await pool.query("select * from reunion where projetId = ?", [
    req.params.projetId,
  ]);
  res.json(rows);
});

module.exports = router;
