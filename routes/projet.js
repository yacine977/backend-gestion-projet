var express = require("express");
const { pool } = require("../services/database");
var router = express.Router();
const checkRole = require("./middleware");

//route get all projets
router.get("/", checkRole("PDG"), async function (req, res, next) {
  const [rows] = await pool.query("select * from projet");
  res.json(rows);
});

//route create new projet
router.post("/", checkRole("PDG"), async function (req, res, next) {
  const {
    nom,
    description,
    dateDebut,
    dateFinPrevu,
    dateFinReel,
    chefDeProjetId,
  } = req.body;

  const [rows] = await pool.query(
    "INSERT INTO Projet (nom, description, dateDebut, dateFinPrevu, dateFinReel, chefDeProjetId) VALUES (?, ?, ?, ?, ?, ?)",
    [
      nom,
      description,
      dateDebut,
      dateFinPrevu,
      dateFinReel || null,
      chefDeProjetId,
    ]
  );
  res.status(201).json(rows);
});

//route get projet by id
router.get("/:id", checkRole("PDG"), async function (req, res, next) {
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
      "UPDATE Projet SET nom = ?, description = ?, dateDebut = ?, dateFinPrevu = ?, dateFinReel = ?, chefDeProjetId = ? WHERE id = ?",
      [
        newData.nom,
        newData.description,
        newData.dateDebut,
        newData.dateFinPrevu,
        newData.dateFinReel,
        newData.chefDeProjetId,
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

// route pour assigner des utilisateurs Firebase à un projet
router.post(
  "/:id/assignerFirebase",
  checkRole("PDG"),
  async function (req, res, next) {
    const idProjet = req.params.id;
    const utilisateurs = req.body.utilisateurs; // un tableau d'UIDs d'utilisateurs Firebase

    try {
      // commence une transaction
      await pool.query("START TRANSACTION");

      for (let uidUtilisateur of utilisateurs) {
        await pool.query(
          "INSERT INTO projet_utilisateur (projetId, utilisateurId) VALUES (?, ?)",
          [idProjet, uidUtilisateur]
        );
      }

      // termine la transaction
      await pool.query("COMMIT");

      res.json({ message: "Utilisateurs Firebase assignés au projet" });
    } catch (err) {
      // en cas d'erreur, annule la transaction
      await pool.query("ROLLBACK");
      next(err);
    }
  }
);

module.exports = router;
