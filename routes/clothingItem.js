const router = require("express").Router();

const auth = require("../middlewares/auth");

const { validateCreateItem, validateId } = require("../middlewares/validation");

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItem");
// Crud

// Create
router.post("/", auth, validateCreateItem, createItem);

// read
router.get("/", getItems);

// update
router.put("/:itemId/likes", auth, validateId, likeItem);

// delete
router.delete("/:itemId", auth, validateId, deleteItem);

router.delete("/:itemId/likes", auth, validateId, dislikeItem);

module.exports = router;