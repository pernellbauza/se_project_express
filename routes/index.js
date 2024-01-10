const router = require("express").Router();

const user = require("./user");

const clothingItem = require("./clothingItem")

const { HTTP_NOT_FOUND } = require("../utils/error");

const auth = require("../middlewares/auth");

router.use("/items", clothingItem);

router.use("/users", auth, user);

router.use((req, res) => {
  res.status(HTTP_NOT_FOUND).send({ message: "Router not found" });
});

module.exports = router;