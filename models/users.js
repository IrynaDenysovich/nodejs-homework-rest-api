const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { connectMongo } = require("../api/mongodb");
const { UsersCollection } = require("../api/users");
const { RigistrationValidate } = require("./validation");

require("dotenv").config();
const secret = process.env.SECRET_KEY;

// REGISTER
const registerUser = async (body) => {
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
