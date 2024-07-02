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
    // Récupérer les dates du projet
    const [projetRows] = await pool.query("SELECT dateDebut, dateFinPrevu FROM Projet WHERE id = ?", [projetId]);
    const projet = projetRows[0];

    if (!projet) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    const projetDebut = new Date(projet.dateDebut);
    const projetFinPrevu = new Date(projet.dateFinPrevu);
    const reunionDateTime = new Date(dateTime);

    // Validation de la date de la réunion
    if (reunionDateTime < projetDebut || reunionDateTime > projetFinPrevu) {
      return res.status(400).json({
        error: "La date de la réunion doit être comprise entre les dates du projet"
      });
    }

    // Insérer la nouvelle réunion
    const [results] = await pool.query(
      "INSERT INTO reunion (sujet, dateTime, projetId, createurId) VALUES (?, ?, ?, ?)",
      [sujet, dateTime, projetId, createurId]
    );

    res.status(201).json({ id: results.insertId, sujet, dateTime, projetId, createurId });
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

  try {
    // Récupère les données existantes de la réunion
    const [existingData] = await pool.query(
      "SELECT * FROM reunion WHERE id = ?",
      [req.params.id]
    );

    // Si la réunion n'existe pas, retourne une erreur 404
    if (!existingData.length) {
      return res.status(404).json({ error: "Réunion non trouvée" });
    }

    const existingReunion = existingData[0];

    // Utilise les nouvelles valeurs ou garde les anciennes si non fournies
    const newSujet = sujet || existingReunion.sujet;
    const newDateTime = dateTime || existingReunion.dateTime;
    const newProjetId = projetId || existingReunion.projetId;
    const newCreateurId = createurId || existingReunion.createurId;

    // Récupérer les dates du projet correspondant
    const [projetRows] = await pool.query("SELECT dateDebut, dateFinPrevu FROM Projet WHERE id = ?", [newProjetId]);
    const projet = projetRows[0];

    if (!projet) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    const projetDebut = new Date(projet.dateDebut);
    const projetFinPrevu = new Date(projet.dateFinPrevu);
    const reunionDateTime = new Date(newDateTime);

    // Validation de la date de la réunion
    if (reunionDateTime < projetDebut || reunionDateTime > projetFinPrevu) {
      return res.status(400).json({
        error: "La date de la réunion doit être comprise entre les dates du projet"
      });
    }

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
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la mise à jour de la réunion");
  }
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





// Récupérer les détails des utilisateurs qui participent à une réunion
router.get("/participation/:reunionId", async function (req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.utilisateurId, u.nom, u.prenom 
       FROM participationreunion pr
       JOIN utilisateur u ON pr.utilisateurId = u.utilisateurId
       WHERE pr.reunionId = ?`,
      [req.params.reunionId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});



//supprimer un utilisateur firebase d'une réunion
router.delete("/supprimer-utilisateur/:reunionId/:utilisateurId", async function (req, res, next) {
  const [rows] = await pool.query("DELETE FROM participationreunion WHERE reunionId = ? AND utilisateurId = ?", [
    req.params.reunionId, req.params.utilisateurId
  ]);
  res.json(rows);
});






module.exports = router;
