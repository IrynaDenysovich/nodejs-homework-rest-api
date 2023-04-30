const passport = require("passport");
const passportJWT = require("passport-jwt");
const { connectMongo } = require("../api/mongodb");
const { UsersCollection } = require("../api/users");
require("dotenv").config();
const secret = process.env.SECRET_KEY;

const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();

const params = {
  secretOrKey: secret,
  jwtFromRequest: jwtFromRequest,
};

const strategy = new Strategy(params, async function (payload, done) {
  await connectMongo();
  const user = await UsersCollection.findOne({ _id: payload.id });
  if (!user) {
    return done(new Error("User not found"));
  }
  return done(null, user);
});

passport.use(strategy);

const bearerAuthenticate = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (jwtFromRequest(req) !== user.token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = {
  clientsAuthenticate: bearerAuthenticate,
};
