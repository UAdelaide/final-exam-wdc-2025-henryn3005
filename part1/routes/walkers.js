var express = require('express');
var router = express.Router();
var db = require('../db');


router.get('/api/walers/summary', async (req, res) => {
    const [rows] = await db.query(`
        SELECT d.name AS dog_name, d.size, u.username AS owner_username
        FROM Dogs d
        JOIN Users u ON d.owner_id = u.user_id
        `);
        res.json(rows);
});

module.exports = router;