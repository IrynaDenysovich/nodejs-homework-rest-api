const express = require("express");
const router = express.Router();
const multer = require("multer");

const { clientsAuthenticate } = require("../config/config-passport");
const {
  registerUser,
  loginUser,
  logoutUser,
  patchAvatar,
  verificationToken,
  verificationResend,
} = require("../models/users");

const upload = multer({ dest: "tmp/" });

router.post("/register", async (req, res, next) => {
  try {
    const { status, model } = await registerUser(req.body, req.headers.host);
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

router.patch(
  "/avatars",
  clientsAuthenticate,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { status, model } = await patchAvatar(req.file.path, req.user);
      res.status(status).json(model);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
);

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { status, model } = await verificationToken(
      req.params.verificationToken
    );
    res.status(status).json(model);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { status, model } = await verificationResend(
      req.body,
      req.headers.host
    );
    res.status(status).json(model);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
