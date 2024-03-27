const router = require("express").Router();

const { getCurrentUser, updateProfile } = require("../controllers/user");

const auth = require("../middlewares/auth");

const { validateUserUpdate } = require("../middlewares/validation");

router.get("/me", auth, getCurrentUser);

router.patch("/me", auth, validateUserUpdate, updateProfile);

module.exports = router;