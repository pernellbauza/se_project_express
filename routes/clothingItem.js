const router = require("express").Router();

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItem");
// Crud

// Create
router.post("/", createItem);

// read
router.get("/", getItems);

// update
router.put("/:itemId/likes", likeItem);

// delete
router.delete("/:itemId", deleteItem);

router.delete("/:itemId/likes", dislikeItem);

module.exports = router;