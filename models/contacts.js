const { connectMongo, getObjectId } = require("../routes/api/mongodb");
const requiredFields = ["name", "email", "phone"];

const readContactArray = async () => {
  const collection = await connectMongo();
  return await collection.find();
};

const listContacts = async () => await readContactArray();

const getContactById = async (contactId) => {
  const objectId = getObjectId(contactId);
  if (!!objectId === true) {
    const ContactCollection = await connectMongo();
    return await ContactCollection.findOne({ _id: objectId });
  }
  return null;
};

const removeContact = async (contactId) => {
  const objectId = getObjectId(contactId);
  if (!!objectId === true) {
    const ContactCollection = await connectMongo();
    const result = await ContactCollection.deleteOne({ _id: objectId });
    return result.deletedCount;
  }
  return false;
};

const addContact = async (body) => {
  if (!checkRequiredFields(body)) return false;
  const { name, email, phone } = body;
  const ContactCollection = await connectMongo();
  const contact = new ContactCollection();
  contact.name = name;
  contact.email = email;
  contact.phone = phone;
  return await contact.save();
};

const updateContact = async (contactId, body) => {
  const updateObject = {};
  for (const field of requiredFields) {
    if (!!body[field] === true) {
      updateObject[field] = body[field];
    }
  }

  const objectId = getObjectId(contactId);
  if (!!objectId === true) {
    const ContactCollection = await connectMongo();
    const result = await ContactCollection.findOneAndUpdate(
      { _id: objectId },
      updateObject,
      { returnDocument: "after" }
    );
    return result;
  }

  return false;
};

const updateStatusContact = async (contactId, body) => {
  const objectId = getObjectId(contactId);
  if (!!objectId === true) {
    const ContactCollection = await connectMongo();
    const result = await ContactCollection.findOneAndUpdate(
      { _id: objectId },
      { favorite: !!body.favorite },
      { returnDocument: "after" }
    );
    return result;
  }

  return false;
};

const checkRequiredFields = (body) => {
  for (const field of requiredFields) {
    if (!!body[field] === false) {
      return false;
    }
  }
  return true;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
