const ClothingItem = require("../models/clothingItem");

const {
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/error");

module.exports.createItem = (req, res) => {
  console.log(req.user._id);
  console.log(req);
  console.log(res.body);

  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((e) => {
      if (e.name === "ValidationError") {
        return res
          .status(HTTP_BAD_REQUEST)
          .send({ message: "Invalid request error on createItem" });
      }
      return res.status(HTTP_INTERNAL_SERVER_ERROR).send({ message: "Error from createItem" });
    });
};

module.exports.getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((e) => {
      next(e);
    });
};

module.exports.deleteItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;
  console.log(itemId);

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (!item.owner.equals(userId)) {
        return Promise.reject(new Error("Not authorized to delete item"));
      }
      return ClothingItem.findByIdAndDelete(itemId).then(() => {
        res.send({ message: `Item ${itemId} deleted` });
      });
    })
    .catch((err) => {
      console.log(err.name);
      if (err.message === "Not authorized to delete item") {
        return res
          .status(HTTP_FORBIDDEN)
          .send({ message: "Not authorized to delete item" });
      }
      if (err.name === `DocumentNotFoundError`) {
        return res
          .status(HTTP_NOT_FOUND)
          .send({ message: `${err.name} error on deleteItem` });
      }
      if (err.name === `CastError`) {
        return res
          .status(HTTP_BAD_REQUEST)
          .send({ message: `${err.name} error on deleteItem` });
      }
      return res.status(HTTP_INTERNAL_SERVER_ERROR).send({ message: "deleteItem failed" });
    });
};

module.exports.likeItem = (req, res) => {
  console.log(req.user._id);
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true },
  )
    .orFail()
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err.name);
      if (err.name === `DocumentNotFoundError`) {
        return res
          .status(HTTP_NOT_FOUND)
          .send({ message: `${err.name} error on likeItem` });
      }
      if (err.name === `CastError`) {
        return res
          .status(HTTP_BAD_REQUEST)
          .send({ message: `${err.name} error on likeItem` });
      }
      return res.status(HTTP_INTERNAL_SERVER_ERROR).send({ message: "likeItem failed" });
    });
};

module.exports.dislikeItem = (req, res) => {
  console.log(req.user._id);
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } }, // remove _id from the array
    { new: true },
  )
    .orFail()
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === `DocumentNotFoundError`) {
        return res
          .status(HTTP_NOT_FOUND)
          .send({ message: `${err.name} error on dislikeItem` });
      }
      if (err.name === `CastError`) {
        return res
          .status(HTTP_BAD_REQUEST)
          .send({ message: `${err.name} error on dislikeItem` });
      }
      return res.status(HTTP_INTERNAL_SERVER_ERROR).send({ message: "dislikeItem failed" });
    });
};