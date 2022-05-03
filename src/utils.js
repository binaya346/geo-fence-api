const jwt = require("jsonwebtoken");
const db = require("../models");
require("dotenv").config();

const response = (res, code, message, data = []) => {
  return res.status(code).json({ message, data, code });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  console.log(authHeader, "authHeader");
  console.log(token, "token");

  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      console.log(err, "error");
      if (err) return res.status(403).send({ error: "Invalid Token" });
      req.user = user;
      console.log(req.user, "user");
      const loggedUser = await db.User.findOne({
        where: { email: req.user.name },
      });
      req.loggedUser = loggedUser;
      next();
    });
  } else {
    return res.status(401).send({ error: "Unauthorized" });
  }
};

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  console.log(authHeader, "authHeader");
  console.log(token, "token");

  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      console.log(user, "user");
      const User = await db.User.findOne({ where: { email: user.name } });

      if (err) return res.status(403).send({ error: "Invalid Token" });
      if (!User?.dataValues?.isStaff) {
        res
          .status(403)
          .send({ error: "User is not authorized to perform the action" });
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).send({ error: "Unauthorized" });
  }
};

module.exports = { response, authenticateToken, authenticateAdmin };
