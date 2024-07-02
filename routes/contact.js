const auth = require("../middlewares/auth");

const router = require("express").Router();

const {
  createContact,
  fetchContacts,
  updateContact,
  deleteContact,
  getContact,
} = require("../controllers/contact");

router.post("/contact", auth, createContact);
router.get("/mycontacts", auth, fetchContacts);
router.put("/contact", auth, updateContact);
router.delete("/delete/:id", auth, deleteContact);
router.get("/contact/:id", auth, getContact);

module.exports = router;
