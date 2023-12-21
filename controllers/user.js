const { default: mongoose } = require("mongoose");

const user = require("../models/user");

const { HTTP_BAD_REQUEST, HTTP_NOT_FOUND } = require("../utils/error");

const createUser = (req, res, next) => {
  console.log(req);
  console.log(res.body);
  const { name, avatar } = req.body;
  user
    .create({ name, avatar })
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

const getUsers = (req, res, next) => {
  user
    .find({})
    .then((item) => res.status(200).send({ data: item }))
    .catch((e) => {
      next(e);
    });
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  user
    .findById(userId)
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

module.exports = { createUser, getUserById, getUsers };