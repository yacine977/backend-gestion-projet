const admin = require("firebase-admin");

var serviceAccount = require("../service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const router = express.Router();

//route pour créer un utilisateur firebase
router.post("/createUser", async function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await admin.auth().createUser({
      email: email,
      password: password,
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//route pour supprimer un utilisateur firebase
router.delete("/deleteUser/:uid", async function (req, res, next) {
  const uid = req.params.uid;

  try {
    await admin.auth().deleteUser(uid);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//route get all utilisateurs firebase
router.get("/allUsers", async function (req, res, next) {
  const users = await admin.auth().listUsers();
  const usersList = users.users.map((user) => {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
    };
  });
  res.json(usersList);
});

// Route pour définir le rôle d'un utilisateur
router.post("/setRole", async function (req, res, next) {
  const uid = req.body.uid;
  const role = req.body.role; // Récupérez le rôle du corps de la requête

  // Définissez le rôle de l'utilisateur
  await admin.auth().setCustomUserClaims(uid, { role: role });

  // Répondez à la requête
  res.json({ message: `Rôle utilisateur ${role} défini avec succès` });
});

// Route pour obtenir le rôle d'un utilisateur
router.get("/getRole/:uid", async function (req, res, next) {
  const uid = req.params.uid;

  // Obtenez les informations de l'utilisateur
  const user = await admin.auth().getUser(uid);

  // Vérifiez si l'utilisateur a des claims personnalisés
  if (user.customClaims) {
    // Récupérez le rôle de l'utilisateur à partir des claims personnalisés
    const role = user.customClaims.role;

    // Répondez à la requête
    res.json({ role: role });
  } else {
    // L'utilisateur n'a pas de rôle défini
    res.json({ message: "L'utilisateur n'a pas de rôle défini" });
  }
});

module.exports = router;
