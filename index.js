const express = require("express");
const app = express();
const port =3000;
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const connection = mysql.createConnection({
    host: "server2.bsthun.com",
    port: "6105",
    user: "lab_1pplpy",
    password: "QLoE22yqlpaRMsj7",
    database: "lab_todo02_1p5ixcz",
  });

connection.on('error', (err) => {
  console.error('MySQL connection error:', err);
  connection.end();
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    connection.end();
  } else {
    console.log("Database is connected");
  }
});

app.use(bodyParser.json({type: "application/json"}));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/login", (req, res) => {
    const username = req.body.username;
	const password = req.body.password;
    connection.query(
        "SELECT hashed_password FROM users WHERE username = ?",
        [username],
        (err, result) => {
        if (err) {
            console.error(err.message);
            return res.json({
              success: false,
              data: null,
              error: err.message,
            });
        }
        if (result.length === 0) {
            return res.status(401).json({ message: "Authentication failed" });
        }
        const hashedPassword = result[0].hashed_password;
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err) {
              console.error(err.message);
              return res.json({
                success: false,
                data: null,
                error: err.message,
              });
            }
            if (result) {
              return res.status(200).json({ message: "Authentication successful" });
            } else {
              return res.status(401).json({ message: "Authentication failed" });
            }
          });
        }
      );
    });

app.post(
    "/register",
    check("password")
      .notEmpty()
      .withMessage("password cannot be empty")
      .isLength({ min: 8 })
      .withMessage("password must be at least 8 characters")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
      .withMessage(
        "password must have at least 1 digit, uppercase, and lowercase"
      ),
    async (req, res) => {
      const username = req.body.username;
      const password = req.body.password;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json({ errors: errors.array() });
      }
      const hash = await bcrypt.hash(password,10);
      connection.query(
        `INSERT INTO users (username, password, hashed_password) VALUES (?,?,?)`,
        [username,password, hash],
        (err, rows) => {
          if (err) {
            res.json({
              success: false,
              data: null,
              error: err.message,
            });
          } else {
            console.log(rows);
            if (rows) {
              res.json({
                success: true,
                data: {
                  message: "Registration successful",
                },
              });
            }
          }
        }
      );
    }
  );

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//Created: Sunday, 7 May BE 2566 23:46
//Modified: Tuesday, 16 May BE 2566 15:54
