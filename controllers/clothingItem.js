const { default: mongoose } = require("mongoose");

const ClothingItem = require("../models/clothingItem");

const {
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_OK_REQUEST,
} = require("../utils/error");

module.exports.createItem = (req, res, next) => {
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
        const validationError = new Error(e.message);
        validationError.statusCode = HTTP_BAD_REQUEST;
        next(validationError);
      }
      next(e);
    });
};

module.exports.getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((e) => {
      next(e);
    });
};

module.exports.deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then((item) => res.status(HTTP_OK_REQUEST).send({ item })) // response should not be empty
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