const ClothingItem = require("../models/clothingItem");

const { BadRequestError } = require("../utils/BadRequestError");

const { ForbiddenError } = require("../utils/ForbiddenError");

const { NotFoundError } = require("../utils/NotFoundError");

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
    .catch((err) => {
      if (err.name === "ValidationError") {
          next(new BadRequestError("Invalid data"));
        }
        next(err);
      });
};

module.exports.getItems = (req, res, next) => {
  ClothingItem.find({})
  .then((items) => res.send(items))
  .catch((err) => {
    next(err);
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
        throw new ForbiddenError("You are not authorized to delete this item");
      }
      return ClothingItem.findByIdAndDelete(itemId).then(() => {
        res.send({ message: `Item ${itemId} deleted` });
      });
    })
    .catch((err) => {
      if (err.name === `DocumentNotFoundError`) {
        next(new NotFoundError());
      }
      if (err.name === `CastError`) {
        next(new BadRequestError("Invalid data"));
      }
      next(err);
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
        next(new NotFoundError());
      }
      if (err.name === `CastError`) {
        next(new BadRequestError("Invalid data"));
      }
      next(err);
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
        next(new NotFoundError());
      }
      if (err.name === `CastError`) {
        next(new BadRequestError("Invalid data"));
      }
      next(err);
    });
};