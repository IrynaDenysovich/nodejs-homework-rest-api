const fs = require("fs/promises");
const path = require("path");
const { uuid } = require("uuidv4");

const contactsJsonName = "contacts.json";
const requiredFields = ["name", "email", "phone"];

const getConstactsPath = () => path.join(__dirname, "/" + contactsJsonName);

const readContactArray = async () => {
  let result = [];
  try {
    const data = await fs.readFile(getConstactsPath(), { encoding: "utf8" });
    result = JSON.parse(data);
  } catch (error) {
    console.error(error);
  }
  return result;
};

const writeContactArray = async (contacts) => {
  let result = false;
  try {
    await fs.writeFile(getConstactsPath(), JSON.stringify(contacts, null, 4), {
      encoding: "utf8",
    });
    result = true;
  } catch (error) {
    console.error(error);
  }
  return result;
};

const listContacts = async () => await readContactArray();

const getContactById = async (contactId) => {
  const contacts = await readContactArray();
  const filteredConstacts = contacts.filter(
    (contact) => contact.id === contactId
  );
  return filteredConstacts[0];
};

const removeContact = async (contactId) => {
  const contacts = await readContactArray();

  for (let i = 0; i < contacts.length; ++i) {
    if (contacts[i].id === contactId) {
      contacts.splice(i, 1);
      await writeContactArray(contacts);
      return true;
    }
  }
  return false;
};

const addContact = async (body) => {
  if (!checkRequiredFields(body)) return false;

  const { name, email, phone } = body;
  const contacts = await readContactArray();
  const contact = {
    id: uuid(),
    name: name,
    email: email,
    phone: phone,
  };
  contacts.push(contact);
  await writeContactArray(contacts);
  return contact;
};

const updateContact = async (contactId, body) => {
  const contacts = await readContactArray();

  for (let i = 0; i < contacts.length; ++i) {
    const contact = contacts[i];
    if (contact.id === contactId) {
      for (const field of requiredFields) {
        if (!!body[field] === true) {
          contact[field] = body[field];
        }
      }
      contacts[i] = contact;
      await writeContactArray(contacts);
      return contacts[i];
    }
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
};
