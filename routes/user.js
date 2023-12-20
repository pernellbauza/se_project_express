const router = require("express").Router();

const { createUser, getUsers, getUserById } = require("../controllers/user");

// Create
router.post("/", createUser);
// read
router.get("/", getUsers);

router.get("/:userId", getUserById);

module.exports = router;