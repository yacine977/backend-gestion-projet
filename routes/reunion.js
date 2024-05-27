var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();

// route pour recupérer toutes les réunions
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("select * from reunion");
  res.json(rows);
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

module.exports = router;
