var express = require('express');
var router = express.Router();
var db = require('../db');


router.get('/api/walkrequests/open', async (req, res) => {
    const [rows] = await db.query(`
        SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username
        FROM WalkRequests wr
        JOIN Dogs d ON wr.dog_id = d.dog_id
        JOIN Users u ON d.owner_id = u.user_id
        WHERE wr.status = 'open'
        `);
        res.json(rows);
});

module.exports = router;