var express = require('express');
var router = express.Router();
var db = require('../db');


router.get('/api/walkers/summary', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        AVG(r.rating) AS average_rating,
        COUNT(wr.request_id) AS completed_walks
        FROM USERS u
        LEFT JOIN WalkRatings
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'failed to return'});
    }

});

module.exports = router;