const { default: mongoose } = require("mongoose");

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

module.exports.likeItem = (req, res, next) => {
  console.log(req.params.itemId);
  console.log(req.user._id);
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((item) => res.status(200).send({ data: item }))
    .catch((e) => {
      if (e instanceof mongoose.CastError) {
        const castError = new Error(e.message);
        castError.statusCode = HTTP_BAD_REQUEST;
        next(castError);
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        const notFoundError = new Error(e.message);
        notFoundError.statusCode = HTTP_NOT_FOUND;
        next(notFoundError);
      } else {
        next(e);
      }
    });
};

module.exports.dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((item) => res.status(200).send({ data: item }))
    .catch((e) => {
      if (e instanceof mongoose.CastError) {
        const castError = new Error(e.message);
        castError.statusCode = HTTP_BAD_REQUEST;
        next(castError);
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        const notFoundError = new Error(e.message);
        notFoundError.statusCode = HTTP_NOT_FOUND;
        next(notFoundError);
      } else {
        next(e);
      }
    });
};