var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dogRouter = require('./routes/dogs');
var walkersRouter = require('./routes/walkers');
var walkrequestsRouter = require('./routes/walkrequests');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async () => {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'test123' // Set your MySQL root password
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await connection.end();

    // Now connect to the created database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'test123',
      database: 'DogWalkService'
    });

    // Create a table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('owner', 'walker') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS Dogs (
        dog_id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        size ENUM('small', 'medium', 'large') NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES Users(user_id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS WalkRequests (
        request_id INT AUTO_INCREMENT PRIMARY KEY,
        dog_id INT NOT NULL,
        requested_time DATETIME NOT NULL,
        duration_minutes INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS WalkApplications (
        application_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        walker_id INT NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
        FOREIGN KEY (walker_id) REFERENCES Users(user_id),
        CONSTRAINT unique_application UNIQUE (request_id, walker_id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS WalkRatings (
        rating_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        walker_id INT NOT NULL,
        owner_id INT NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        comments TEXT,
        rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
        FOREIGN KEY (walker_id) REFERENCES Users(user_id),
        FOREIGN KEY (owner_id) REFERENCES Users(user_id),
        CONSTRAINT unique_rating_per_walk UNIQUE (request_id)
      )
    `);



    // Insert data if table is empty
    const [userRows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if (userRows[0].count === 0) {
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hased456', 'walker'),
        ('carol123', 'carol@example.com', 'hashed789', 'owner'),
        ('dannydonuts', 'danny@example.com', 'dandog123', 'owner'),
        ('lennylongsocks', 'lenny@example.com', 'soxcrew123', 'owner');
      `);
    }

    const [dogRows] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
    if (dogRows[0].count === 0) {
      await db.execute(`
        INSERT INTO Dogs (owner_id, name, size) VALUES
        (1, 'Max', 'medium'),
        (3, 'Bella', 'small'),
        (4, 'SirWoofsalot', 'large'),
        (5, 'Trousers', 'small'),
        (4, 'KingBarks', 'small')
      `);
    }

    const [walkrequestsRows] = await db.execute('SELECT COUNT(*) AS count FROM WalkRequests');
    if (walkrequestsRows[0].count === 0) {
      await db.execute(`
        INSERT INTO WalkRequests (dog_id, request_time, duration_minutes, location, status) VALUES
        (1, '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
        (1, '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
        (1, '2025-06-10 10:00:00', 20, 'Royal Lane', 'accepted'),
        (1, '2025-06-10 04:35:00', 60, 'Royal Lane', 'open'),
        (1, '2025-07-10 09:00:00', 30, 'Mars', 'open')
      `);
    }

    const [ratingsRows] = await db.execute('SELECT COUNT(*) AS count FROM WalkRatings');
    if (ratingsRows[0].count === 0) {
      await db.execute(`
        INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES
        (2, 3, 2, 5, 'Great Service'),
        (3, 3, 2, 4, 'Great Service'),
        (2, 3, 2, 5, 'Great Service'),
        (2, 3, 2, 5, 'Great Service'),
        (2, 3, 2, 5, 'Great Service'),
      `);
    }
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', dogRouter);
app.use('/api', walkersRouter);
app.use('/api', walkrequestsRouter);

module.exports = app;
