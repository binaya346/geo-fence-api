const express = require("express");
const db = require("../../models");
const router = express.Router();
const { response, authenticateToken, authenticateAdmin } = require("../utils");
const { validateSchema } = require("../../models/geofence");
const { Op } = require("sequelize");
const moment = require("moment");

router.post("/", authenticateAdmin, async (req, res) => {
  const { error } = validateSchema(req.body);
  if (error) {
    return response(res, 400, error.details[0].message);
  }
  postGeofence(req.body, res);
});

const postGeofence = async (body, res) => {
  const { name, longitude, latitude, description, radius, guid } = body;

  let geofence;
  geofence = new db.Geofence({
    name,
    longitude,
    latitude,
    description,
    radius,
    guid,
  });

  try {
    geofence = await geofence.save();
    return response(res, 200, `Successfully Created geofence`, geofence);
  } catch (err) {
    return response(res, 400, `Error 400: Bad request ${err.errmsg}`);
  }
};

router.get("/", async (req, res) => {
  const { name, longitude, latitude, radius } = req.query;
  const where = {};
  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (longitude) {
    where.longitude = { [Op.like]: `%${longitude}%` };
  }
  if (latitude) {
    where.latitude = { [Op.like]: `%${latitude}%` };
  }
  if (radius) {
    where.radius = radius;
  }
  const geofence = await db.Geofence.findAll({
    where,
  });
  return response(res, 200, "Success", geofence);
});

router.get("/countries", async (req, res) => {
  const countries = await db.Country.findAll();
  return response(res, 200, "Success", countries);
});

router.put("/:id", authenticateAdmin, async (req, res) => {
  const id = req.params.id;

  const geofence = await db.Geofence.findOne({ where: { id } });
  if (!geofence) {
    return response(res, 404, "Id not found");
  }

  geofence.description = req.body.description;
  try {
    await geofence.save();
    return response(res, 200, "success", geofence.description);
  } catch (err) {
    console.log(err, "error");
  }
});

router.delete("/:id", authenticateAdmin, async (req, res) => {
  const id = req.params.id;

  const geofence = await db.Geofence.findOne({ where: { id } });
  if (!geofence) {
    return response(res, 404, "Landmark not found");
  }

  try {
    await geofence.destroy();
    return response(res, 200, "success", geofence.description);
  } catch (err) {
    console.log(err, "error");
  }
});

router.get("/dashboard/pie-chart", authenticateAdmin, async (req, res) => {
  const countries = await db.User.findAll({
    group: ["country"],
    attributes: [
      "country",
      [db.Sequelize.fn("COUNT", "country"), "country_count"],
    ],
    order: [[db.Sequelize.literal("country_count"), "DESC"]],
    raw: true, // <-- HERE
    where: { isTourist: true },
  });

  const totalUsers = await db.User.count();
  let countryName = [];
  let countryCount = [];
  let totalCountryCount = 0;
  for (let i = 0; i < countries.length; i++) {
    const data = await db.Country.findByPk(countries[i].country);
    countryName.push(data?.dataValues?.name);
    countryCount.push(countries[i].country_count);
    totalCountryCount += countries[i].country_count;
  }
  countryName.push("Others");
  countryCount.push(totalUsers - 1 - totalCountryCount);
  const piechat = [countryName, countryCount];

  // Pie chart end here...

  let barChart = [];

  for (let i = 0; i < 12; i++) {
    const results = await db.User.count({
      where: {
        createdAt: {
          [Op.gt]: moment("0101", "MMDD").add(i, "months").toDate(),
          [Op.lte]: moment("0101", "MMDD")
            .add(i + 1, "months")
            .toDate(),
        },
      },
    });
    barChart.push(results);
  }

  // Bar chart end here...

  let lineChart = [];
  let maleLineChart = [];
  let femaleLineChart = [];
  let otherLineChart = [];

  for (let i = 0; i < 12; i++) {
    const female = await db.User.count({
      where: {
        createdAt: {
          [Op.gt]: moment("0101", "MMDD").add(i, "months").toDate(),
          [Op.lte]: moment("0101", "MMDD")
            .add(i + 1, "months")
            .toDate(),
        },
        gender: "Female",
      },
    });
    const male = await db.User.count({
      where: {
        createdAt: {
          [Op.gt]: moment("0101", "MMDD").add(i, "months").toDate(),
          [Op.lte]: moment("0101", "MMDD")
            .add(i + 1, "months")
            .toDate(),
        },
        gender: "Male",
      },
    });
    const other = await db.User.count({
      where: {
        createdAt: {
          [Op.gt]: moment("0101", "MMDD").add(i, "months").toDate(),
          [Op.lte]: moment("0101", "MMDD")
            .add(i + 1, "months")
            .toDate(),
        },
        gender: "Other",
      },
    });
    femaleLineChart.push(female);
    maleLineChart.push(male);
    otherLineChart.push(other);
  }
  lineChart = [maleLineChart, femaleLineChart, otherLineChart];

  // Line chart end here...

  const geofenceList = await db.Geofence.findAll({
    limit: 5,
    order: [["createdAt", "DESC"]],
  });

  // End of geo fence

  const touristList = await db.User.findAll({
    where: { isTourist: true },
    include: [
      {
        model: db.Country,
        as: "user_country",
        attributes: ["id", "name"],
      },
    ],
    limit: 5,
    order: [["createdAt", "DESC"]],
  });

  return response(res, 200, "success", {
    piechat,
    barChart,
    lineChart,
    geofenceList,
    touristList,
  });
});

module.exports = router;
