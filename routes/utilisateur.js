const admin = require('firebase-admin');

var serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const express = require('express');
const router = express.Router();

// Route pour définir le rôle d'un utilisateur 
router.post("/setRole", async function (req, res, next) {
    const uid = req.body.uid;
  
    // Définissez le rôle de l'utilisateur
    await admin.auth().setCustomUserClaims(uid, {role: 'standard'});

  
    // Répondez à la requête
    res.json({message: 'Rôle utilisateur standard défini avec succès'});
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
        res.json({role: role});
    } else {
        // L'utilisateur n'a pas de rôle défini
        res.json({message: "L'utilisateur n'a pas de rôle défini"});
    }
});

module.exports = router;