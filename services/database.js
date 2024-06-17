const mysql = require("mysql2/promise");

// Initialisation d'un pool de connexions à la base de données MySQL
// Ceci permet de gérer efficacement plusieurs connexions simultanées à la base de données.
const pool = mysql.createPool({
  host: "localhost", // Adresse du serveur de la base de données
  user: "root", // Nom d'utilisateur pour se connecter à la base de données
  database: "gestion-projet", // Nom de la base de données à utiliser
  waitForConnections: true, // Attendre des connexions disponibles en cas de dépassement du `connectionLimit`
  connectionLimit: 10, // Nombre maximum de connexions simultanées autorisées
  // `maxIdle` n'est pas une option reconnue par mysql2 et sera ignorée. La documentation officielle ne mentionne pas cette option.
  idleTimeout: 60000, // Durée maximale, en millisecondes, pendant laquelle une connexion peut rester inactive avant d'être fermée
  queueLimit: 0, // Taille maximale de la file d'attente d'attente de connexion. 0 signifie pas de limite.
  enableKeepAlive: true, // Active la fonctionnalité keep-alive pour les connexions au serveur de base de données
  keepAliveInitialDelay: 0, // Délai initial avant le début de l'envoi des paquets keep-alive
});

module.exports = { pool };
