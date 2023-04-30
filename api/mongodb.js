const username = "karpushynairyna";
const password = "Q4ZLSOdYQoJ08Fxf";

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

async function connect() {
  await mongoose.connect(
    `mongodb+srv://${username}:${password}@cluster0.vjc5v8s.mongodb.net/db-contacts`
  );
}

const connectMongo = async () => {
  await connect()
    .then(() => {
      console.log("Database connection successful");
    })
    .catch(() => process.exit(1));
};

const getObjectId = (value) => {
  if (ObjectId.isValid(value)) {
    return new ObjectId(value);
  }
  return null;
};

module.exports = {
  connectMongo,
  getObjectId,
};
