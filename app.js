var cors = require("cors");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");

var projetRouter = require("./routes/projet");
var tacheRouter = require("./routes/tache");
var documentRouter = require("./routes/document");
var reunionRouter = require("./routes/reunion");
var utilisateurRouter = require("./routes/utilisateur");

var app = express();

// view engine setup
app.use(cors());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

app.use("/projet", projetRouter);
app.use("/tache", tacheRouter);
app.use("/document", documentRouter);
app.use("/reunion", reunionRouter);
app.use("/utilisateur", utilisateurRouter);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
