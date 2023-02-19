const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const saltRounds = 10;
const secret = "mySecretKey";

const { pool } = require("./db");

// Route for user login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM punonjesi WHERE E_id = $1", [
      username,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].passwordi
    );
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ username: user.rows[0].e_id }, secret);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Route for user registration
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await pool.query(
      "SELECT * FROM punonjesi WHERE E_id = $1",
      [username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query(
      "INSERT INTO punonjesi (e_id, passwordi, roli) VALUES ($1, $2, $3)",
      [username, hashedPassword, role]
    );
    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
