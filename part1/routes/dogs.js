var express = require('express');
var router = express.Router();
var db = require('../db');


router.get('api/dogs', async (req, res) => {
    const [rows] = await db.query(`
        SELECT d.name AS dog_name, d.size, u.username
        `);
        res.json(rows);
});