var express = require('express');
var router = express.Router();
var db = require('../db');


router.get('/api/walkrequests/open', async (req, res) => {
    const [rows] = await db.query(`
        SELECT wr.request_i
        `);
        res.json(rows);
});

module.exports = router;