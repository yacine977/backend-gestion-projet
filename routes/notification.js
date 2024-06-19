var express = require('express');
const { pool } = require('../services/database');
var router = express.Router();

//creer une nouvelle notification
router.post('/nouvelle-notification', async (req, res) => {
    const { message, dateHeure, utilisateurId } = req.body;
    if (!message || !dateHeure || !utilisateurId) {
      return res.status(400).send({ error: 'Les données message, dateHeure et utilisateurId sont requises.' });
    }
  
    try {
      const query = 'INSERT INTO notification (message, dateHeure, utilisateurId) VALUES (?, ?, ?)';
      const [result] = await pool.query(query, [message, dateHeure, utilisateurId]);
      res.status(201).send({ success: 'Notification créée avec succès.', id: result.insertId });
    } catch (error) {
      console.error('Erreur lors de la création de la notification :', error);
      res.status(500).send({ error: 'Erreur serveur.' });
    }
});

// Récupérer les notifications d'un utilisateur
router.get('/notifications/:utilisateurId', async (req, res) => {
    const utilisateurId = req.params.utilisateurId;

    try {
        const query = 'SELECT * FROM notification WHERE utilisateurId = ?';
        const [notifications] = await pool.query(query, [utilisateurId]);
        if (notifications.length > 0) {
            res.status(200).send(notifications);
        } else {
            res.status(404).send({ error: 'Aucune notification trouvée pour cet utilisateur.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des notifications :', error);
        res.status(500).send({ error: 'Erreur serveur.' });
    }
});






  
  module.exports = router;




