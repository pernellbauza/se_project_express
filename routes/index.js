const router = require("express").Router();

const user = require("./user");

const clothingItem = require("./clothingItem");

const { NotFoundError } = require("../utils/NotFoundError");

const auth = require("../middlewares/auth");

router.use("/items", clothingItem);

router.use("/users", auth, user);

router.use((req, res, next) => {
  next(new NotFoundError("Resource not found"));
});

module.exports = router;