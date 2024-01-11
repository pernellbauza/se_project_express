const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const User = require("../models/user");

const {
  HTTP_OK_REQUEST,
  HTTP_BAD_REQUEST,
  HTTP_UNAUTHORIZED,
  HTTP_NOT_FOUND,
  HTTP_CONFLICT,
  HTTP_INTERNAL_SERVER_ERROR,
  } = require("../utils/error");

const { JWT_SECRET } = require("../utils/config");

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;
  if (!email) {
    res
      .status(HTTP_BAD_REQUEST)
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
        res.status(HTTP_CONFLICT).send({ message: "User already exists" });
      } else if (err.name === `ValidationError`) {
        res
          .status(HTTP_BAD_REQUEST)
          .send({ message: "Invalid request error on createUser" });
      } else {
        res.status(HTTP_INTERNAL_SERVER_ERROR).send({ message: "Error from createUser" });
      }
    });
};

const updateUser = (req, res) => {
  const { userId } = req.params;
  const { name, avatar } = req.body;

  User
    .findByIdAndUpdate(userId, { $set: { name, avatar } },
      { new: true, runValidators: true })
    .orFail()
    .then((user) => res.status(HTTP_OK_REQUEST).send({ data: user }))
    .catch((e) => {
      if (e.name === "ValidationError") {
        res
          .status(HTTP_BAD_REQUEST)
          .send({ message: `${e.name} error on getCurrentUser` });
      } else if (e.name === "DocumentNotFoundError") {
        res
          .status(HTTP_NOT_FOUND)
          .send({ message: `${e.name} error on getCurrentUser` });
      } else {
        res
          .status(HTTP_INTERNAL_SERVER_ERROR)
          .send({ message: `${e.name} error on updateProfile` });
      }
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User
    .findById(userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((e) => {
      console.error("Error fetching user from the database: ", e);
      res
        .status(HTTP_INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  return User
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((e) => {
      console.log(e.name);
      if (e.name === "Incorrect email or password") {
        return res.status(HTTP_UNAUTHORIZED).send({ message: e.message });
      }
        return res.status(HTTP_INTERNAL_SERVER_ERROR).send({ message: e.message });
    });
};

module.exports = { createUser, getCurrentUser, updateUser, login };