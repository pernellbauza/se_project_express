const router = require("express").Router();

const user = require("./user");

const clothingItem = require("./clothingItem")

const { HTTP_NOT_FOUND } = require("../utils/error");

const auth = require("../middlewares/auth");

const {
  createUser,
  login,
  getCurrentUser,
  updateUser,
} = require("../controllers/user");

router.use("/signin", login);

router.use("/signup", userValidation, createUser);

router.use("/items", clothingItem);

router.use("/users", auth, user);

router.use("/users/me", auth, getCurrentUser);

router.patch("/users/me", auth, updateUser);


router.use((req, res) => {
  res.status(HTTP_NOT_FOUND).send({ message: "Router not found" });
});

module.exports = router;