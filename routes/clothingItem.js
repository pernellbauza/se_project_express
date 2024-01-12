const router = require("express").Router();

const auth = require("../middlewares/auth");

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItem");
// Crud

// Create
router.post("/", auth, createItem);

// read
router.get("/", getItems);

// update
router.put("/:itemId/likes", auth, likeItem);

// delete
router.delete("/:itemId", auth, deleteItem);

router.delete("/:itemId/likes", auth, dislikeItem);

module.exports = router;