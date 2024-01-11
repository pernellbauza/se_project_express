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
router.post("/", createItem);

// read
router.get("/", getItems);

// update
router.put("/:itemId/likes", likeItem);

// delete
router.delete("/:itemId", deleteItem);

router.delete("/:itemId/likes", auth, dislikeItem);

module.exports = router;