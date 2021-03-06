const express = require("express");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//start after esb

const dataurl = process.env.dataurl || "http://localhost:";
const dataport = process.env.dataport || 4500;
const serviceurl = process.env.serviceurl || "http://localhost:";
const serviceport = process.env.PORT || 4502;
const esburl = process.env.esburl || "http://localhost:";
const esbport = process.env.esbport || 4505;

const key = process.env.ACCESS_TOCKEN_SECRET;

const esb = esburl; // + esbport;
const datalayer = dataurl; // + dataport;

const app = express();
app.use(cors());
app.use(express.json());

app.options("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  res.status(200).send();
});

app.post("/event", (req, res) => {
  if (req.body.type == "AuthenticationNeeded") {
    const token = req.body.data.token;
    jwt.verify(token, key, (err, decoded) => {
      if (err) {
        res.status(401).send("Token is invalid");
        console.log(err);
        console.log(token);
      }
      res.status(200).send(decoded);
    });
  } else {
    res.status(404).send();
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  axios
    .get(datalayer + "/user/" + username, { validateStatus: false })
    .then((response) => {
      if (response.status == 401) {
        res.status(401).send("Incorrect username or password");
        return;
      } else if (response.status == 200 && password == response.data.password) {
        const head = { username, user_id: response.data.user_id };
        const token = jwt.sign(head, key);
        res.status(200).send({ token });
      } else res.status(500).send();
    });
});

app.post("/signup", (req, res) => {
  const details = req.body;

  axios
    .get(datalayer + "/user/" + details.username, { validateStatus: false })
    .then((response) => {
      console.log(response.data);
      if (response.data.user_id) {
        res
          .status(400)
          .send("User with username " + details.username + " already exists");
        return;
      }
      axios
        .post(
          datalayer + "/user/signup",
          {
            username: details.username,
            password: details.password,
          },
          { validateStatus: false }
        )
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
    at: serviceurl + "/event",
  });
});
