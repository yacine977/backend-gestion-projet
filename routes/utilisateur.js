const admin = require("firebase-admin");
const serviceAccount = require("../service-account-key.json");
const { pool } = require("../services/database");

// Initialisation de l'application Firebase avec les identifiants de service
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const router = express.Router();

// Création d'un utilisateur Firebase et insertion dans la base de données
router.post("/createUser", async (req, res) => {
  const { nom, prenom, email, telephone, motDePasse } = req.body;

  // Vérification des champs requis
  if (!nom || !prenom || !email || !telephone || !motDePasse) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Format d'email invalide." });
  }

  // Validation du téléphone (exemple basique, peut nécessiter une expression plus complexe selon les besoins)
  const telRegex = /^\d{10}$/;
  if (!telRegex.test(telephone)) {
    return res.status(400).json({ message: "Format de téléphone invalide." });
  }

  try {
    // Création de l'utilisateur dans Firebase
    const userRecord = await admin.auth().createUser({ email, password: motDePasse });

    // Insérer l'utilisateur dans MySQL
    const [result] = await pool.query(
      "INSERT INTO utilisateur (utilisateurId, nom, prenom, email, telephone, motDePasse) VALUES (?, ?, ?, ?, ?, ?)",
      [userRecord.uid, nom, prenom, email, telephone, motDePasse]
    );

    res.json({ firebaseUser: userRecord, mysqlUser: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Suppression d'un utilisateur Firebase et de la base de données
router.delete("/deleteUser/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    await admin.auth().deleteUser(uid);
    await pool.query("DELETE FROM utilisateur WHERE utilisateurId = ?", [uid]);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Mise à jour d'un utilisateur Firebase et de la base de données
router.put("/updateUser/:uid", async (req, res) => {
  const { uid } = req.params;
  const { nom, prenom, email, telephone, motDePasse } = req.body;

  // Vérification des champs requis
  if (!nom || !prenom || !email || !telephone || !motDePasse) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Format d'email invalide." });
  }

  // Validation du téléphone (exemple basique, peut nécessiter une expression plus complexe selon les besoins)
  const telRegex = /^\d{10}$/;
  if (!telRegex.test(telephone)) {
    return res.status(400).json({ message: "Format de téléphone invalide." });
  }

  try {
    // Mise à jour de l'utilisateur dans Firebase
    await admin.auth().updateUser(uid, { email, password: motDePasse });

    // Mise à jour de l'utilisateur dans MySQL
    await pool.query(
      "UPDATE utilisateur SET nom = ?, prenom = ?, email = ?, telephone = ?, motDePasse = ? WHERE utilisateurId = ?",
      [nom, prenom, email, telephone, motDePasse, uid]
    );

    res.json({ message: "Utilisateur mis à jour avec succès" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Récupération de tous les utilisateurs de la base de données
router.get("/getAllUsers", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM utilisateur");
    res.json(rows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Définition du rôle d'un utilisateur
router.post("/setRole", async (req, res) => {
  const { uid, role } = req.body;

  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    res.json({ message: `Rôle utilisateur ${role} défini avec succès` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtention du rôle d'un utilisateur
router.get("/getRole/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const user = await admin.auth().getUser(uid);
    const role = user.customClaims ? user.customClaims.role : null;
    if (role) {
      res.json({ role });
    } else {
      res.json({ message: "L'utilisateur n'a pas de rôle défini" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
