const express = require("express");
const axios = require("axios");
const mysql = require("mysql");
require("dotenv").config();

const serviceport = process.env.serviceport || 4500;
const dbport = process.env.dbport || 3306;

const app = express();
app.use(express.json());

const con = mysql.createConnection({
  host: "localhost",
  user: "askmebackend",
  password: "askme123",
  database: "askme",
  port: dbport,
});

app.get("/user/:username", (req, res) => {
  const username = req.params.username;

  con.query(
    "SELECT username, password, user_id FROM user WHERE username = ?",
    [username],
    (err, result, fields) => {
      if (err) res.status(500).send("Trouble getting to the database");
      else if (result.length == 0) res.status(401).send();
      else
        res.status(200).send({
          username: result[0].username,
          password: result[0].password,
          user_id: result[0].user_id,
        });
    }
  );
});

app.listen(serviceport, () => {
  console.log("Data Layer listening on port " + serviceport + "...");
});