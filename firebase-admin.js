// Importation du SDK Admin Firebase pour accéder aux services Firebase côté serveur
const admin = require("firebase-admin");

// Chargement des identifiants de l'application Firebase à partir d'un fichier JSON
// Ce fichier contient la clé privée et d'autres identifiants nécessaires pour l'authentification
var serviceAccount = require("./service-account-key.json");

// Initialisation de l'application Firebase avec les identifiants chargés
// et configuration de l'URL de la base de données pour accéder à la base de données Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gestion-projet-90ac6.firebaseio.com",
});

// Exportation de l'instance admin initialisée pour l'utiliser dans d'autres parties de l'application
module.exports = admin;
