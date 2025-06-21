var express = require('express');
var router = express.Router();
var db = require('../db');


router.get('/api/walers/summary', async (req, res) => {
    const [rows] = await db.query(`
        SELECT u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        ROUND(AVG(r.rating),1) AS average_rating,
        ()
        `);
        res.json(rows);
});

module.exports = router;