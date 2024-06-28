const admin = require("firebase-admin");

/**
 * Middleware pour vérifier le rôle d'un utilisateur.
 * @param {string} role - Le rôle requis pour accéder à la route.
 * @returns {Function} Un middleware express qui vérifie le rôle de l'utilisateur.
 */ 
function checkRole(role) {
  return async function (req, res, next) {
    // Extrait le token ID depuis le header Authorization
    const idToken = req.headers.authorization.split("Bearer ")[1];

    try {
      // Vérifie le token ID avec Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Récupère les informations de l'utilisateur via son UID
      admin
        .auth()
        .getUser(uid)
        .then((user) => {
          // Vérifie si l'utilisateur a le rôle requis
          if (user.customClaims && user.customClaims.role === role) {
            next(); // Passe au middleware suivant si le rôle correspond
          } else {
            // Renvoie une erreur 403 si l'utilisateur n'a pas le bon rôle
            res.status(403).json({ message: "Accès refusé" });
          }
        })
        .catch((error) => {
          // Gère les erreurs lors de la récupération des informations de l'utilisateur
          res.status(500).json({ error: error });
        });
    } catch (error) {
      // Gère les erreurs lors de la vérification du token ID
      res
        .status(500)
        .json({
          error: "Erreur lors de la vérification du jeton d'authentification",
        });
    }
  };
}

module.exports = checkRole;
