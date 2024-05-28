const admin = require('firebase-admin');

// Fonction pour vérifier le rôle d'un utilisateur
function checkRole(role) {
    return async function(req, res, next) {
        const idToken = req.headers.authorization.split('Bearer ')[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;

            admin.auth().getUser(uid)
                .then((user) => {
                    if (user.customClaims && user.customClaims.role === role) {
                        next();
                    } else {
                        res.status(403).json({message: "Accès refusé"});
                    }
                })
                .catch((error) => {
                    res.status(500).json({error: error});
                });
        } catch (error) {
            res.status(500).json({error: 'Erreur lors de la vérification du jeton d\'authentification'});
        }
    }
}

module.exports = checkRole;