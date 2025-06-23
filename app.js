const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;

// Use connection pool for better performance :contentReference[oaicite:1]{index=1}
const db = mysql.createPool({
  host: 'testdb-1.c34egoce037f.ap-south-1.rds.amazonaws.com',
  user: 'root',
  password: '12345678',
  database: 'testdb_1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Connect check
db.getConnection((err, conn) => {
  if (err) {
    console.error('MySQL Pool Error:', err);
    process.exit(1);
  }
  console.log('MySQL connected via pool');
  conn.release();
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create table
app.get('/createTable', (req, res, next) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    )`;
  db.query(sql, (err) => {
    if (err) return next(err);
    res.send('Items table created.');
  });
});

// Parameterized CRUD routes
app.post('/addItem', (req, res, next) => {
  const sql = 'INSERT INTO items (name) VALUES (?)';
  db.query(sql, [req.body.name], (err) => {
    if (err) return next(err);
    res.send('Item added.');
  });
});

app.get('/getItems', (req, res, next) => {
  db.query('SELECT * FROM items', (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

app.get('/getItem/:id', (req, res, next) => {
  db.query('SELECT * FROM items WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

app.put('/updateItem/:id', (req, res, next) => {
  db.query('UPDATE items SET name = ? WHERE id = ?', [req.body.name, req.params.id], (err) => {
    if (err) return next(err);
    res.send('Item updated.');
  });
});

app.delete('/deleteItem/:id', (req, res, next) => {
  db.query('DELETE FROM items WHERE id = ?', [req.params.id], (err) => {
    if (err) return next(err);
    res.send('Item deleted.');
  });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error');
});

// Listen on all interfaces so EC2 and Docker can access :contentReference[oaicite:2]{index=2}
app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
});
