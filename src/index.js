const express = require("express");
const app = express();
const db = require("../models");
const user = require("./controller/user");
const geofence = require("./controller/geofence");
const cors = require("cors");

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

app.get("/organizations", async (req, res) => {
  const organizations = await db.Organization.findAll();
  return res.json({ data: organizations });
});
app.use(cors());
app.use("/auth", user);
app.use("/geo", geofence);

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
