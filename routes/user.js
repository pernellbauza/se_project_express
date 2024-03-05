const router = require("express").Router();

const { getCurrentUser, updateUser } = require("../controllers/user");

const auth = require("../middlewares/auth");

const { validateUserUpdate } = require("../middlewares/validation");

router.get("/me", auth, getCurrentUser);

router.patch("/me", auth, validateUserUpdate, updateUser);

module.exports = router;