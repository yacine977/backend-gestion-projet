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
  const [rows] = await pool.query("SELECT * FROM document WHERE id = ?", [
    req.params.id,
  ]);
  if (rows.length > 0) {
    // Si le document existe, le renvoie
    res.json(rows[0]);
  } else {
    // Sinon, renvoie un statut 404
    res.status(404).end();
  }
});

// Met à jour un document par son ID
router.put("/:id", async function (req, res, next) {
  const { nom, type, cheminAcces, utilisateurId, projetId } = req.body;

  // Vérifie d'abord si le document existe
  const [existingData] = await pool.query(
    "SELECT * FROM document WHERE id = ?",
    [req.params.id]
  );

  if (!existingData.length) {
    // Si le document n'existe pas, renvoie une erreur 404
    return res.status(404).json({ error: "Document not found" });
  }

  let updateQuery = "UPDATE document SET ";
  let queryParams = [];

  // Construit dynamiquement la requête de mise à jour en fonction des champs fournis
  if (nom !== undefined) {
    updateQuery += "nom = ?, ";
    queryParams.push(nom);
  }

  if (type !== undefined) {
    updateQuery += "type = ?, ";
    queryParams.push(type);
  }

  if (cheminAcces !== undefined) {
    updateQuery += "cheminAcces = ?, ";
    queryParams.push(cheminAcces);
  }

  if (utilisateurId !== undefined) {
    updateQuery += "utilisateurId = ?, ";
    queryParams.push(utilisateurId);
  }

  if (projetId !== undefined) {
    updateQuery += "projetId = ?, ";
    queryParams.push(projetId);
  }

  updateQuery = updateQuery.slice(0, -2); // Supprime la dernière virgule et espace
  updateQuery += " WHERE id = ?";
  queryParams.push(req.params.id);

  // Exécute la requête de mise à jour
  await pool.query(updateQuery, queryParams);
  res.status(200).json({ message: "Document updated successfully" });
});

// Supprime un document par son ID
router.delete("/:id", async function (req, res, next) {
  // Exécute la requête de suppression
  const [rows] = await pool.query("DELETE FROM document WHERE id = ?", [
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