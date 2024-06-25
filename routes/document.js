var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

// Crée un nouveau document pour un projet spécifique
router.post("/", async function (req, res, next) {
  const { nom, type, cheminAcces, utilisateurId, projetId } = req.body;
  // Exécute la requête d'insertion dans la base de données
  const [rows] = await pool.query(
    "INSERT INTO document (nom, type, cheminAcces, utilisateurId, projetId) VALUES (?, ?, ?, ?, ?)",
    [nom, type, cheminAcces, utilisateurId, projetId]
  );
  // Renvoie le document créé avec un statut 201
  res.status(201).json({
    id: rows.insertId,
    nom,
    type,
    cheminAcces,
    utilisateurId,
    projetId,
  });
});

// Récupère tous les documents
router.get("/", async function (req, res, next) {
  // Sélectionne tous les documents de la base de données
  const [rows] = await pool.query("SELECT * FROM document");
  // Renvoie les documents trouvés
  res.json(rows);
});

// Récupère un document par son ID
router.get("/:id", async function (req, res, next) {
  // Sélectionne un document par son ID
  const [rows] = await pool.query("SELECT * FROM document WHERE documentId = ?", [
    req.params.id,
  ]);
  if (!rows.length) {
    // Si aucun document n'est trouvé, renvoie une erreur 404
    res.status(404).json({ message: "Document not found" });
  } else {
    // Sinon, renvoie le document trouvé
    res.json(rows[0]);
  }
});

// Met à jour un document par son ID
router.put("/:id", async function (req, res, next) {
  const { nom, type, cheminAcces, utilisateurId, projetId } = req.body;
  // Exécute la requête de mise à jour
  const [rows] = await pool.query(
    "UPDATE document SET nom = ?, type = ?, cheminAcces = ?, utilisateurId = ?, projetId = ? WHERE documentId = ?",
    [nom, type, cheminAcces, utilisateurId, projetId, req.params.id]
  );
  if (rows.affectedRows === 0) {
    // Si aucun document n'est mis à jour, renvoie une erreur 404
    res.status(404).json({ message: "Document not found" });
  } else {
    // Sinon, renvoie le document mis à jour
    res.status(200).json({
      id: req.params.id,
      nom,
      type,
      cheminAcces,
      utilisateurId,
      projetId,
    });
  }
});

// Supprime un document par son ID
router.delete("/:id", async function (req, res, next) {
  // Exécute la requête de suppression
  const [rows] = await pool.query("DELETE FROM document WHERE documentId = ?", [
    req.params.id,
  ]);
  if (rows.affectedRows === 0) {
    // Si aucun document n'est supprimé, renvoie une erreur 404
    res.status(404).json({ message: "Document not found" });
  } else {
    // Sinon, confirme la suppression
    res.status(200).json({ message: "Document deleted successfully" });
  }
});

// Récupère les documents d'un projet spécifique
router.get("/projet/:projetId", async function (req, res, next) {
  const { projetId } = req.params;
  // Sélectionne les documents d'un projet spécifique
  const [documents] = await pool.query(
    "SELECT * FROM document WHERE projetId = ?",
    [projetId]
  );

  if (!documents.length) {
    // Si aucun document n'est trouvé, renvoie un tableau vide
    return res.status(200).json([]);
  }

  // Sinon, renvoie les documents trouvés
  res.status(200).json(documents);
});


module.exports = router;