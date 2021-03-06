const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mysql = require("mysql");
require("dotenv").config();

const dbport = process.env.dbport || 3306;
const dbuser = process.env.dbuser || "keywordbackend";
const dbpass = process.env.dbpass || "keyword123";
const dbhost = process.env.dbhost || "localhost";
const dbname = process.env.dbname || "askme_keyword";
const eventaddr = process.env.eventaddr || "http://localhost:";

const eventport = process.env.eventport || 4005;
const serviceport = process.env.PORT || 4003;

const eventservice = eventaddr + "/events";

const app = express();
app.use(express.json());
app.use(cors());

const sqloptions = {
  host: "eu-cdbr-west-01.cleardb.com",
  user: "b0d7842fcfe32b",
  password: "8b3c11c8",
  database: "heroku_ca207ccd350e6f8",
  //port: dbport,
};

let con = mysql.createPool(sqloptions);
con.on("error", () => {
  con = mysql.createPool(sqloptions);
});

app.options("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  res.status(200).send();
});

app.get("/keyword/byquestions", (req, res) => {
  con.query(
    "SELECT k.word, COUNT(*) as questions FROM `keyword` k INNER JOIN hasword h ON k.keyword_id = h.keyword_id GROUP BY k.keyword_id ORDER BY COUNT(*) DESC",
    (err, result, fields) => {
      if (err) {
        res.status(500).send("Database is down");
      } else {
        res.status(200).send(result);
      }
    }
  );
});

app.post("/events", (req, res) => {
  if (req.body.type == "KeywordsPosted") {
    let keywords = req.body.data.keywords;
    //console.log("Event KeywordsPosted arrived at Keywords service");
    //console.log(keywords);
    for (let i = 0; i < keywords.length; i++) {
      keywords[i] = [keywords[i]];
    }
    con.query(
      "INSERT IGNORE INTO keyword(word) VALUES ?",
      [keywords],
      (err, result, fields) => {
        if (err) {
          //console.log(err);
          res.status(500).send("Database error");
          return;
        }
        con.query(
          "INSERT IGNORE INTO hasword(question_id, keyword_id) SELECT ?, keyword_id FROM keyword WHERE word IN (?)",
          [req.body.data.id, keywords],
          (err, result, fields) => {
            if (err) {
              //console.log("Error3");
              res.status(500).send("Database error");
              return;
            }

            res.status(200).send();

            con.query(
              "SELECT * FROM keyword WHERE word in (?)",
              [keywords],
              (err, result, fields) => {
                if (err) throw err;
                axios
                  .post(eventservice, {
                    type: "KeywordsUpdated",
                    data: { id: req.body.data.id, keywords: result },
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }
            );
          }
        );
      }
    );
  } else {
    res.status(200).send();
  }
});

app.listen(serviceport, () => {
  console.log("Keyword service listening on port " + serviceport + "...");
});
