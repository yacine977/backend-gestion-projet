// Importation des modules nécessaires
var cors = require("cors");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Importation des routeurs pour différentes parties de l'application
var indexRouter = require("./routes/index");
var projetRouter = require("./routes/projet");
var tacheRouter = require("./routes/tache");
var documentRouter = require("./routes/document");
var reunionRouter = require("./routes/reunion");
var utilisateurRouter = require("./routes/utilisateur");

// Initialisation de l'application Express
var app = express();

// Configuration du moteur de vue
app.use(cors()); // Activation de CORS pour permettre les requêtes cross-origin
app.set("views", path.join(__dirname, "views")); // Définition du dossier contenant les vues
app.set("view engine", "ejs"); // Utilisation de EJS comme moteur de template

// Middleware pour le logging, le parsing des requêtes et la gestion des cookies
app.use(logger("dev")); // Logging des requêtes HTTP
app.use(express.json()); // Parsing des requêtes JSON
app.use(express.urlencoded({ extended: false })); // Parsing des requêtes URL-encoded
app.use(cookieParser()); // Parsing des cookies
app.use(express.static(path.join(__dirname, "public"))); // Serveur de fichiers statiques

// Définition des routes principales de l'application
app.use("/", indexRouter);
app.use("/projet", projetRouter);
app.use("/tache", tacheRouter);
app.use("/document", documentRouter);
app.use("/reunion", reunionRouter);
app.use("/utilisateur", utilisateurRouter);

// Gestion des erreurs 404 (ressource non trouvée)
app.use(function (req, res, next) {
  next(createError(404));
});

// Gestionnaire d'erreurs
app.use(function (err, req, res, next) {
  // Configuration des variables locales, fournissant des détails d'erreur uniquement en développement
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Rendu de la page d'erreur
  res.status(err.status || 500);
  res.render("error");
});

// Exportation de l'application pour utilisation dans d'autres fichiers
module.exports = app;
