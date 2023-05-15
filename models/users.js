const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const { connectMongo } = require("../api/mongodb");
const { UsersCollection } = require("../api/users");
const { RigistrationValidate } = require("./validation");
const { jimpResizeAndDelete } = require("../utils/jimp");
const { sendMail } = require("./mailer");

require("dotenv").config();
const secret = process.env.SECRET_KEY;
const publicDir = process.env.PUBLIC_DIRECTORY;
const avatarsDir = process.env.AVATARS_DIRECTORY;
const mailtrapAuth = {
  user: process.env.MAILTRAP_USER,
  pass: process.env.MAILTRAP_PASS,
};

// REGISTER
const registerUser = async (body, host) => {
  const { complete, model } = await RigistrationValidate(body);
  if (!complete) {
    return {
      status: 400,
      model: model,
    };
  }

  await connectMongo();
  const existsUser = await UsersCollection.findOne({
    email: model.email,
  });

  if (existsUser) {
    return {
      status: 409,
      model: {
        message: "Email in use",
      },
    };
  }

  model.avatarURL = gravatar.url(model.email, { s: "200" });
  model.verificationToken = uuidv4();

  await sendMail(model, mailtrapAuth, host);

  model.password = await bcrypt.hash(model.password, 10);
  const newUser = new UsersCollection(model);
  const result = await newUser.save();
  return {
    status: 201,
    model: {
      email: result.email,
      subscription: result.subscription,
    },
  };
};

// LOGIN
const loginUser = async (body) => {
  const { complete, model } = await RigistrationValidate(body);

  if (!complete) {
    return {
      status: 400,
      model: model,
    };
  }

  const emailPasswordResponse = {
    status: 401,
    model: {
      message: "Email or password is wrong",
    },
  };

  await connectMongo();
  const existsUser = await UsersCollection.findOne({
    email: model.email,
    verify: true,
  });

  if (!existsUser) {
    return emailPasswordResponse;
  }

  const compare = await bcrypt.compare(model.password, existsUser.password);
  if (!compare) {
    return emailPasswordResponse;
  }

  const payload = {
    id: existsUser._id,
    email: existsUser.email,
  };

  existsUser.token = jwt.sign(payload, secret, { expiresIn: "1h" });
  const result = await existsUser.save();
  return {
    status: 201,
    model: {
      token: result.token,
      user: {
        email: result.email,
        subscription: result.subscription,
      },
    },
  };
};

// LOGOUT
const logoutUser = async (user) => {
  user.token = null;
  await user.save();
  return 204;
};

// PATCH AVATAR
const patchAvatar = async (file, user) => {
  const result = await jimpResizeAndDelete(file);
  const avatarFile = user._id + "." + result.getExtension();
  const avatarPath = path.join(publicDir, avatarsDir, avatarFile);
  await renameFile(file, avatarPath);
  user.avatarURL = path.join(avatarsDir, avatarFile);
  const saveResult = await user.save();
  return {
    status: 200,
    model: { avatarURL: saveResult.avatarURL },
  };
};

const renameFile = async (oldName, newName) => {
  await new Promise((resolve, reject) => {
    fs.rename(oldName, newName, (err) => {
      if (err) {
        console.error(err);
        reject(new Error("Rename Error"));
      } else resolve();
    });
  });
};

// verification Token
const verificationToken = async (token, host) => {
  await connectMongo();
  const user = await UsersCollection.findOne({
    verificationToken: token,
  });

  if (!user) {
    return {
      status: 404,
      model: {
        message: "User not found",
      },
    };
  }

  user.verificationToken = null;
  user.verify = true;

  await user.save();

  return {
    status: 200,
    model: {
      message: "Verification successful",
    },
  };
};

// verification Resend
const verificationResend = async (body, host) => {
  if (!!body.email === false) {
    return {
      status: 400,
      model: { message: "missing required field email" },
    };
  }

  await connectMongo();
  const user = await UsersCollection.findOne({
    email: body.email,
  });

  if (!user) {
    return {
      status: 404,
      model: {
        message: "User not found",
      },
    };
  }

  if (user.verify) {
    return {
      status: 400,
      model: {
        message: "Verification has already been passed",
      },
    };
  }

  await sendMail(user, mailtrapAuth, host);

  return {
    status: 200,
    model: {
      message: "Verification email sent",
    },
  };
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  patchAvatar,
  verificationToken,
  verificationResend,
};
