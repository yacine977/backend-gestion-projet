var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();
const checkRole = require("./middleware");

//route get all projets sans role
router.get("/", async function (req, res, next) {
  const [rows] = await pool.query("select * from projet");
  res.json(rows);
});



//route create new projet
router.post("/", checkRole("PDG"), async function (req, res, next) {
  const { nom, description, dateDebut, dateFinPrevu, dateFinReel } = req.body;

  const [rows] = await pool.query(
    "INSERT INTO Projet (nom, description, dateDebut, dateFinPrevu, dateFinReel) VALUES (?, ?, ?, ?, ?)",
    [nom, description, dateDebut, dateFinPrevu, dateFinReel || null]
  );
  res.status(201).json(rows);
});

//route get projet by id
router.get("/:id", async function (req, res, next) {
  const [rows] = await pool.query("select * from projet where id = ?", [
    req.params.id,
  ]);
  res.json(rows);
});


//route update projet
router.put("/:id", checkRole("PDG"), async function (req, res, next) {
  try {
    // Récupérer l'objet existant
    const [rows] = await pool.query("SELECT * FROM Projet WHERE id = ?", [
      req.params.id,
    ]);
    const oldData = rows[0];

    // Fusionner les anciennes et les nouvelles valeurs
    const newData = {
      ...oldData,
      ...req.body,
    };

    // Effectuer la mise à jour
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

//route pour delete projet
router.delete("/:id", checkRole("PDG"), async function (req, res, next) {
  const [rows] = await pool.query("DELETE FROM Projet WHERE id = ?", [
    req.params.id,
  ]);
  res.json(rows);
});

// route pour valider un projet
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

// route pour modifier le chef de projet d'un projet
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

// route pour assigner des utilisateur firebase à un projet 
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

//route pour renvoyer selement les noms des projets auquel un utilisateur est assigné
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

//route pour afficher la liste des utilisateurs firebase assignés à un projet
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
