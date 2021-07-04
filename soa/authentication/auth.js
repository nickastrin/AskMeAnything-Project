const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const dataport = process.env.dataport || 4500;
const serviceport = process.env.serviceport || 4502;
const esbport = process.env.esbport || 4505;

const key = process.env.ACCESS_TOCKEN_SECRET;

const esb = "http://localhost:" + esbport;
const datalayer = "http://localhost:" + dataport;

const app = express();
app.use(express.json());

app.post("/event", (req, res) => {
  if (req.body.type == "AuthenticationNeeded") {
    const token = req.body.data.token;
    jwt.verify(token, key, (err, decoded) => {
      if (err) res.status(401).send("Token is invalid");
      res.status(200).send(decoded);
    });
  } else {
    res.status(404).send();
  }
});

app.post("/post/answer", (req, response) => {
  const question_id = req.body.question_id;
  const answer = req.body.answer;
  const time = req.body.timestamp;
  const authHeader =
    req.headers["x-observatory-auth"] || req.headers["authorization"];

  axios
    .post(esb + "/event", {
      type: "AuthenticationNeeded",
      data: {
        token: authHeader,
      },
    })
    .then((res) => {
      if (res.status == 500) {
        response.status(500).send("Could not reach services");
        return;
      }
      if (res.status == 401) {
        response.status(401).send("Bad login/Not logged in");
        return;
      }
      const user_id = res.body.user_id;

      axios
        .post(datalayer + "/answer", {
          question_id,
          answer,
          time,
          user_id,
        })
        .then((res) => {
          const status = res.status;
          const body = res.data;
          response.status(status).send(body);
        });
    });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  axios.get(datalayer + "/user/" + username).then((response) => {
    if (response.status == 401) {
      res.status(401).send("Incorrect username or password");
      return;
    } else if (response.status == 200) {
      const head = { username, user_id: response.data.user_id };
      const token = jwt.sign(head, key);
      res.status(200).send(token);
    } else res.status(500).send();
  });
});

app.post("/signup", (req, res) => {
  const details = req.body;

  axios.get(datalayer + "/user/" + details.username).then((response) => {
    if (response.data.user_id) {
      res
        .status(400)
        .send("User with username " + detauls.username + " already exists");
      return;
    }
    axios
      .post(datalayer + "/user/signup", {
        username: details.username,
        password: details.password,
      })
      .then((response) => {
        if (response.status == 200) {
          res.status(200).send("User has been created");
          return;
        }
        res.status(500).send();
      });
  });
});

app.listen(serviceport, () => {
  console.log("Auth service listening on port " + serviceport + "...");
  axios.post(esb + "/register", {
    type: "RegisterService",
    provides: "AuthenticationNeeded",
    at: "http://localhost:" + serviceport + "/event",
  });
});
