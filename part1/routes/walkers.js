var express = require('express');
var router = express.Router();
var db = require('../db');


router.get('/api/walkers/summary', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        ROUND(AVG(r.rating),1) AS average_rating,
        (
        SELECT COUNT(*)
        FROM WalkRequests wr
        JOIN WalkApplications wa ON wr.request_id = wa.request_id
        WHERE wr.status = 'completed' AND wa.walker_id = u.user_id
        )
        AS completed_walks
        FROM Users u
        LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
        WHERE u.role = 'walker'
        GROUP BY u.user_id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'failed to return'});
    }

});

module.exports = router;