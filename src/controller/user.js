const express = require("express");
const router = express.Router();
require("dotenv").config();
const { validateSchema } = require("../../models/user");
const db = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response, authenticateToken } = require("../utils");
const { Op } = require("sequelize");

router.post("/login", async (req, res) => {
  const { password, email } = req.body;
  const user = await db.User.findOne({
    where: { email: email },
    // include: [
    //   {
    //     model: db.Organization,
    //     as: "user_organization",
    //     attributes: ["id", "name", "logo", "colorCode"],
    //   },
    // ],
  });

  if (!user) {
    return response(res, 400, "Email Doesnt exist");
  }

  try {
    if (await bcrypt.compare(password, user.password)) {
      const authToken = jwt.sign(
        { name: user.email },
        process.env.ACCESS_TOKEN_SECRET
      );
      return res.send({
        authToken: authToken,
        user: user,
      });
    } else {
      return res.send({ error: "Password didn't match" });
    }
  } catch (err) {
    console.log(err, "error");
    return res.status(500).send();
  }
});

router.post("/register", async (req, res) => {
  console.log(req.body, "request.body");
  try {
    const { error } = validateSchema(req.body);
    const user = await db.User.findOne({ where: { email: req.body.email } });
    if (user) return res.status(400).send({ error: "User already exists" });

    if (error) {
      return res.status(400).send(error.details[0].message);
    }
  } catch (err) {
    console.log(err, "error");
  }

  postUser(req.body, res);
});

const postUser = async (data, res) => {
  const {
    firstName,
    lastName,
    email,
    isStaff,
    phone,
    address,
    gender,
    password,
    isTourist,
    country,
  } = data;

  let post;

  post = new db.User({
    firstName,
    lastName,
    email,
    isStaff,
    phone,
    address,
    gender,
    isTourist,
    password: await bcrypt.hash(password, 10),
    country,
  });
  try {
    post = await post.save();
  } catch (err) {
    console.log(err, "error");
    return res.status(400).send(`Error 400: Bad request ${err.errmsg}`);
  }

  return res.status(200).send(post);
};

router.get("/tourists", async (req, res) => {
  const { country, email, firstName, lastName } = req.query;
  const where = { isTourist: true };
  if (country) {
    where.country = country;
  }
  if (email) {
    where.email = email;
  }
  if (firstName) {
    where.firstName = { [Op.like]: `%${firstName}%` };
  }
  if (lastName) {
    where.lastName = { [Op.like]: `%${lastName}%` };
  }

  const user = await db.User.findAll({
    where,
    include: [
      {
        model: db.Country,
        as: "user_country",
        attributes: ["id", "name"],
      },
    ],
  });
  response(res, 200, "", user);
});

router.post("/tourist-log", authenticateToken, async (req, res) => {
  const { geofence, remark } = req.body;
  const user_id = req.loggedUser.id;

  try {
    const geofenceId = await db.Geofence.findOne({ where: { name: geofence } });
    const result = await db.TouristLog.create({
      geofence: geofenceId.id,
      remark: remark || "",
      user_id,
    });
    response(res, 200, "Success", result);
  } catch (err) {
    console.log(err, "Error");
    response(res, 400, "failed to post");
  }
});

router.get("/tourist-log", authenticateToken, async (req, res) => {
  const user_id = req.loggedUser.id;
  const tourist_id = req.query.id;

  const is_tourist = req.loggedUser.isTourist;
  let result;
  try {
    if (is_tourist) {
      result = await db.TouristLog.findAll({
        where: {
          user_id: user_id,
        },
        include: [
          {
            model: db.Geofence,
            as: "log_geofence",
            attributes: ["id", "name"],
          },
          {
            model: db.User,
            as: "log_user",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      });
    } else {
      if (tourist_id) {
        result = await db.TouristLog.findAll({
          where: {
            user_id: is_tourist,
          },
          include: [
            {
              model: db.Geofence,
              as: "log_geofence",
              attributes: ["id", "name"],
            },
            {
              model: db.User,
              as: "log_user",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        });
      } else {
        result = await db.TouristLog.findAll({
          include: [
            {
              model: db.Geofence,
              as: "log_geofence",
              attributes: ["id", "name"],
            },
            {
              model: db.User,
              as: "log_user",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        });
      }
    }
    response(res, 200, "Success", result);
  } catch (err) {
    console.log(err, "Error");
    response(res, 400, "failed to post");
  }
});

module.exports = router;
