const express = require("express");
const { clientsAuthenticate } = require("../config/config-passport");
const { registerUser, loginUser, logoutUser } = require("../models/users");
const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { status, model } = await registerUser(req.body);
    res.status(status).json(model);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { status, model } = await loginUser(req.body);
    res.status(status).json(model);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/logout", clientsAuthenticate, async (req, res, next) => {
  try {
    const status = await logoutUser(req.user);
    res.status(status).json();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/current", clientsAuthenticate, async (req, res, next) =>
  res.status(200).json({
    email: req.user.email,
    subscription: req.user.subscription,
  })
);

module.exports = router;
