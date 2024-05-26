var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

// route pour créer un nouveau document pour un projet donné
router.post("/", async function (req, res, next) {
  const { nom, type, cheminAcces, utilisateurId, projetId } = req.body;
  const [rows] = await pool.query(
    "INSERT INTO document (nom, type, cheminAcces, utilisateurId, projetId) VALUES (?, ?, ?, ?, ?)",
    [nom, type, cheminAcces, utilisateurId, projetId]
  );
  res.status(201).json({
    id: rows.insertId,
    nom,
    type,
    cheminAcces,
    utilisateurId,
    projetId,
  });
});

//route get all documents
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("select * from document");
  res.json(rows);
});

//route get document by id
router.get("/:id", async function (req, res, next) {
  const [rows] = await pool.query("select * from document where id = ?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});

// Route GET pour récupérer un document par son ID
router.get("/:id", async function (req, res, next) {
  const [rows] = await pool.query("SELECT * FROM document WHERE id = ?", [
    req.params.id,
  ]);
  if (rows.length > 0) {
    res.json(rows[0]);
  } else {
    res.status(404).end();
  }
});

//route update document by id
router.put("/:id", async function (req, res, next) {
  const { nom, type, cheminAcces, utilisateurId, projetId } = req.body;

  // First, retrieve the existing data
  const [existingData] = await pool.query(
    "SELECT * FROM document WHERE id = ?",
    [req.params.id]
  );

  // If the document doesn't exist, return a 404 error
  if (!existingData.length) {
    return res.status(404).json({ error: "Document not found" });
  }

  let updateQuery = "UPDATE document SET ";
  let queryParams = [];

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

  // Remove the last comma and space
  updateQuery = updateQuery.slice(0, -2);

  updateQuery += " WHERE id = ?";
  queryParams.push(req.params.id);

  await pool.query(updateQuery, queryParams);
  res.status(200).json({ message: "Document updated successfully" });
});

//route delete document by id
router.delete("/:id", async function (req, res, next) {
  const [rows] = await pool.query("DELETE FROM document WHERE id = ?", [
    req.params.id,
  ]);
  if (rows.affectedRows === 0) {
    res.status(404).json({ message: "Document not found" });
  } else {
    res.status(200).json({ message: "Document deleted successfully" });
  }
});

module.exports = router;
