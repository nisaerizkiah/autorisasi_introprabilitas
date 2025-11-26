require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { dbMovies, dbDirectors } = require("./database.js");

const app = express();
const PORT = process.env.PORT || 3200;
const JWT_SECRET = process.env.JWT_SECRET || "rahasia";

// Middleware untuk parsing JSON body
app.use(bodyParser.json());

// middleware authentikasi
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });

    req.user = decoded.user;
    next();
  });
}

// middleware autorisasi role
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      return res.status(403).json({ message: "Akses ditolak: Role tidak sesuai" });
    }
  };
}

// endpoint registrasi user default
app.post("/auth/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username dan password wajib diisi" });

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
  const params = [username.toLowerCase(), hashedPassword, "user"];

  dbDirectors.run(sql, params, function (err) {
    if (err) {
      if (err.message.includes("UNIQUE"))
        return res.status(409).json({ error: "Username sudah digunakan" });

      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: "Registrasi berhasil", userId: this.lastID });
  });
});

// endpoint registrasi admin
app.post("/auth/register-admin", (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
  const params = [username.toLowerCase(), hashedPassword, "admin"];

  dbDirectors.run(sql, params, function (err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(409).json({ error: "Username admin sudah ada" });
      }
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: "Admin berhasil dibuat", userId: this.lastID });
  });
});

// endpoint login sesuai role
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username dan password wajib diisi" });

  const sql = "SELECT * FROM users WHERE username = ?";
  dbDirectors.get(sql, [username.toLowerCase()], (err, user) => {
    if (err) return res.status(500).json({ message: "Terjadi kesalahan server" });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Password salah" });

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      res.json({ message: "Login berhasil", token: token });
    });
  });
});


// directors

// GET Directors (public)
app.get("/directors", (req, res) => {
  const sql = "SELECT * FROM directors ORDER BY id ASC";
  dbDirectors.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil data" });
    res.json({ data: rows });
  });
});

// GET by ID (public)
app.get("/directors/:id", (req, res) => {
  const sql = "SELECT * FROM directors WHERE id = ?";
  dbDirectors.get(sql, [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ message: "Tidak ditemukan" });
    res.json({ data: row });
  });
});

// POST Directors (User & Admin)
app.post("/directors", authenticateToken, (req, res) => {
  const { name, country } = req.body;
  const sql = "INSERT INTO directors (name, country) VALUES (?, ?)";

  dbDirectors.run(sql, [name, country], function (err) {
    if (err) return res.status(500).json({ message: "Gagal menambah data" });
    res.json({ message: "Data ditambahkan", id: this.lastID });
  });
});

// PUT (Admin only)
app.put("/directors/:id", [authenticateToken, authorizeRole("admin")], (req, res) => {
  const { name, country } = req.body;
  const sql = "UPDATE directors SET name = ?, country = ? WHERE id = ?";

  dbDirectors.run(sql, [name, country, req.params.id], function (err) {
    if (this.changes === 0) return res.status(404).json({ message: "Tidak ditemukan" });
    res.json({ message: "Data diperbarui" });
  });
});

// DELETE (Admin only)
app.delete("/directors/:id", [authenticateToken, authorizeRole("admin")], (req, res) => {
  const sql = "DELETE FROM directors WHERE id = ?";

  dbDirectors.run(sql, [req.params.id], function (err) {
    if (this.changes === 0) return res.status(404).json({ message: "Tidak ditemukan" });
    res.json({ message: "Data dihapus" });
  });
});


// endpoint status
app.get("/status", (req, res) => {
  res.json({
    ok: true,
    status: "Server is running",
    service: "Directors API (JWT + RBAC)",
  });
});

// jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});