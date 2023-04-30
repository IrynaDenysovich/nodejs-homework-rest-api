const { ContactCollection } = require("../api/contacts");
const { getObjectId } = require("../api/mongodb");

const requiredFields = ["name", "email", "phone"];

const listContacts = async (user) =>
  await ContactCollection.find({ owner: user._id });

const getContactById = async (user, contactId) => {
  const objectId = getObjectId(contactId);
  if (!!objectId === true) {
    return await ContactCollection.findOne({ _id: objectId, owner: user._id });
  }
  return null;
};

const removeContact = async (user, contactId) => {
  const objectId = getObjectId(contactId);
  if (!!objectId === true) {
    const result = await ContactCollection.deleteOne({
      _id: objectId,
      owner: user._id,
    });
    return result.deletedCount;
  }
  return false;
};

const addContact = async (user, body) => {
  if (!checkRequiredFields(body)) return false;
  const { name, email, phone } = body;
  const contact = new ContactCollection({
    name: name,
    email: email,
    phone: phone,
    owner: user._id,
  });
  return await contact.save();
};

const updateContact = async (user, contactId, body) => {
  const updateObject = {};
  for (const field of requiredFields) {
    if (!!body[field] === true) {
      updateObject[field] = body[field];
    }
  }

  const objectId = getObjectId(contactId);
  if (!!objectId === true) {
    const result = await ContactCollection.findOneAndUpdate(
      { _id: objectId, owner: user._id },
      updateObject,
      { returnDocument: "after" }
    );
    return result;
  }

  return false;
};

const updateStatusContact = async (user, contactId, body) => {
  const objectId = getObjectId(contactId);
  if (!!objectId === true) {
    const result = await ContactCollection.findOneAndUpdate(
      { _id: objectId, owner: user._id },
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
