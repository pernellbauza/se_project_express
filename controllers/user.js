const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const User = require("../models/user");

const { BadRequestError } = require("../utils/BadRequestError");

const { ConflictError } = require("../utils/ConflictError");

const { NotFoundError } = require("../utils/NotFoundError");

const { UnauthorizedError } = require("../utils/UnauthorizedError");

const { JWT_SECRET } = require("../utils/config");

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;
  if (!email) {
    res
      .status(BadRequestError)
      .send({ message: "Cannot create user with no email" });
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        return Promise.reject(new Error("User with email already exists"));
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then(() => res.send({ name, avatar, email }))
    .catch((err) => {
      console.log(err.message);
      if (err.message === "User with email already exists") {
        res.status(ConflictError).send({ message: "User already exists" });
      } else if (err.name === `ValidationError`) {
        res
          .status(BadRequestError)
          .send({ message: "Invalid request error on createUser" });
      } else {
        res.status(HTTP_INTERNAL_SERVER_ERROR).send({ message: "Error from createUser" });
      }
    });
};

const updateUser = (req, res) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  User
    .findByIdAndUpdate(userId, { $set: { name, avatar } },
      { new: true, runValidators: true })
    .orFail()
    .then((user) => res.status(HTTP_OK_REQUEST).send({ data: user }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res
          .status(BadRequestError)
          .send({ message: `${err.name} error on getCurrentUser` });
      } else if (err.name === "DocumentNotFoundError") {
        res
          .status(NotFoundError)
          .send({ message: `${err.name} error on getCurrentUser` });
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User
    .findById(userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      console.error("Error fetching user from the database: ", err);
      res
        .status(NotFoundError)
        .json({ error: "Internal server error" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(BadRequestError)
      .send({ message: "Email and or password field is empty" });
  }

  return User
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.log(err.name);
      if (err.message === "Incorrect email or password") {
        return res.status(UnauthorizedError).send({ message: `${err.message}` });
      } else {
        next(err);
      }
    });
};

module.exports = { createUser, getCurrentUser, updateUser, login };