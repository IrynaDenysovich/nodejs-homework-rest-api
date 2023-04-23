const express = require("express");
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");

const router = express.Router();

router.get("/", async (req, res, next) =>
  res.json({ data: await listContacts() })
);

router.get("/:contactId", async (req, res, next) => {
  const contact = await getContactById(req.params.contactId);
  if (contact) {
    res.json({ data: contact });
  } else {
    res.status(404).json({ message: "Not found" });
  }
});

router.post("/", async (req, res, next) => {
  const contact = await addContact(req.body);
  contact
    ? res.status(201).json(contact)
    : res.status(404).json({ message: "missing required name field" });
});

router.delete("/:contactId", async (req, res, next) =>
  (await removeContact(req.params.contactId))
    ? res.status(200).json({ message: "contact deleted" })
    : res.status(404).json({ message: "Not found" })
);

router.put("/:contactId", async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    res.status(404).json({ message: "missing fields" });
    return;
  }

  const contact = await updateContact(req.params.contactId, req.body);
  contact
    ? res.status(201).json(contact)
    : res.status(404).json({ message: "Not found" });
});

router.post("/:contactId/favorite", async (req, res, next) => {
  const keys = Object.keys(req.body);
  if (keys.length === 0 || !keys.includes("favorite")) {
    res.status(404).json({ message: "missing field favorite" });
    return;
  }

  const contact = await updateStatusContact(req.params.contactId, req.body);
  contact
    ? res.status(201).json(contact)
    : res.status(404).json({ message: "Not found" });
});

module.exports = router;
