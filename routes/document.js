var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

// route pour créer un nouveau document
router.post("/", async function (req, res, next) {
  const { nom, type, cheminAcces, utilisateurId } = req.body;
  const [rows] = await pool.query(
    "INSERT INTO document (nom, type, cheminAcces, utilisateurId) VALUES (?, ?, ?, ?)",
    [nom, type, cheminAcces, utilisateurId]
  );
  res
    .status(201)
    .json({ id: rows.insertId, nom, type, cheminAcces, utilisateurId });
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

//route delete document by id
router.delete("/:id", async function (req, res, next) {
  await pool.query("delete from document where id = ?", [req.params.id]);
  res.status(204).end();
});

//route update document by id
router.put("/:id", async function (req, res, next) {
  const { nom, type, cheminAcces, utilisateurId } = req.body;

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

  // Remove the last comma and space
  updateQuery = updateQuery.slice(0, -2);

  updateQuery += " WHERE id = ?";
  queryParams.push(req.params.id);

  await pool.query(updateQuery, queryParams);
  res.status(204).end();
});

module.exports = router;
