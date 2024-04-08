const ClothingItem = require("../models/clothingItem");

const { BadRequestError } = require("../utils/BadRequestError");

const { ForbiddenError } = require("../utils/ForbiddenError");

const { NotFoundError } = require("../utils/NotFoundError");

const createItem = (req, res, next) => {
  console.log(req.user._id);
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === `ValidationError`) {
        next(new BadRequestError("Invalid data"));
      }
      next(err);
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      next(err);
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;
  console.log(itemId);

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (!item.owner.equals(userId)) {
        throw new ForbiddenError("You are not authorized to delete this item");
      }
      return ClothingItem.findByIdAndDelete(itemId).then(() => {
        res.send({ message: `Item ${itemId} deleted` });
      });
    })
    .catch((err) => {
      if (err.name === `NotFoundError`) {
        next(new NotFoundError());
      }
      if (err.name === `CastError`) {
        next(new BadRequestError("Invalid data"));
      }
      next(err);
    });
};

const likeItem = (req, res, next) => {
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
      if (err.name === `NotFoundError`) {
        next(new NotFoundError());
      }
      if (err.name === `CastError`) {
        next(new BadRequestError("Invalid data"));
      }
      next(err);
    });
};

const dislikeItem = (req, res, next) => {
  console.log(req.user._id);
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true },
  )
    .orFail()
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === `NotFoundError`) {
        next(new NotFoundError());
      }
      if (err.name === `CastError`) {
        next(new BadRequestError("Invalid data"));
      }
      next(err);
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};