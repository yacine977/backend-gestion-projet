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
    const query = 'INSERT INTO notification (message, dateHeure, utilisateurId, isNew) VALUES (?, ?, ?, TRUE)';
    const [result] = await pool.query(query, [message, dateHeure, utilisateurId]);
    res.status(201).send({ success: 'Notification créée avec succès.', id: result.insertId });
  } catch (error) {
    console.error('Erreur lors de la création de la notification :', error);
    res.status(500).send({ error: 'Erreur serveur.' });
  }
});


// Récupérer les notifications d'un utilisateur avec pagination
router.get('/notifications/:utilisateurId', async (req, res) => {
  const utilisateurId = req.params.utilisateurId;
  const limit = parseInt(req.query.limit) || 4; // Nombre de notifications par page, par défaut 10
  const offset = parseInt(req.query.offset) || 0; // Décalage pour la pagination, par défaut 0

  try {
      const query = 'SELECT * FROM notification WHERE utilisateurId = ? LIMIT ? OFFSET ?';
      const [notifications] = await pool.query(query, [utilisateurId, limit, offset]);
      const countQuery = 'SELECT COUNT(*) as count FROM notification WHERE utilisateurId = ?';
      const [countResult] = await pool.query(countQuery, [utilisateurId]);
      const totalNotifications = countResult[0].count;

      if (notifications.length > 0) {
          res.status(200).send({ notifications, totalNotifications });
      } else {
          res.status(404).send({ error: 'Aucune notification trouvée pour cet utilisateur.' });
      }
  } catch (error) {
      console.error('Erreur lors de la récupération des notifications :', error);
      res.status(500).send({ error: 'Erreur serveur.' });
  }
});


//route Mettre à jour les notifications une fois vues
router.put('/notifications/:utilisateurId/mark-as-read', async (req, res) => {
  const utilisateurId = req.params.utilisateurId;

  try {
    const query = 'UPDATE notification SET isNew = FALSE WHERE utilisateurId = ?';
    await pool.query(query, [utilisateurId]);
    res.status(200).send({ success: 'Notifications marquées comme lues.' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications :', error);
    res.status(500).send({ error: 'Erreur serveur.' });
  }
});

// Vérifier s'il y a des nouvelles notifications pour un utilisateur
router.get('/notifications/:utilisateurId/new', async (req, res) => {
  const utilisateurId = req.params.utilisateurId;

  try {
      const query = 'SELECT COUNT(*) as count FROM notification WHERE utilisateurId = ? AND isNew = TRUE';
      const [result] = await pool.query(query, [utilisateurId]);
      const newNotificationsCount = result[0].count;
      res.status(200).send({ newNotificationsCount });
  } catch (error) {
      console.error('Erreur lors de la vérification des nouvelles notifications :', error);
      res.status(500).send({ error: 'Erreur serveur.' });
  }
});

//route Mettre à jour une notification individuelle une fois vue
router.put('/notifications/:utilisateurId/mark-as-read/:notificationId', async (req, res) => {
  const { utilisateurId, notificationId } = req.params;

  try {
    const query = 'UPDATE notification SET isNew = FALSE WHERE utilisateurId = ? AND id = ?';
    await pool.query(query, [utilisateurId, notificationId]);
    res.status(200).send({ success: 'Notification marquée comme lue.' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification :', error);
    res.status(500).send({ error: 'Erreur serveur.' });
  }
});

// Supprimer une notification par ID
router.delete('/notifications/:notificationId', async (req, res) => {
  const notificationId = req.params.notificationId;

  try {
    const query = 'DELETE FROM notification WHERE id = ?';
    await pool.query(query, [notificationId]);
    res.status(200).send({ success: 'Notification supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification :', error);
    res.status(500).send({ error: 'Erreur serveur.' });
  }
});








  
  module.exports = router;




