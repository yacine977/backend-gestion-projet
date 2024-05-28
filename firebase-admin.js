const admin = require('firebase-admin');

var serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gestion-projet-90ac6.firebaseio.com"
});

module.exports = admin;