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
    throw new BadRequestError("Invalid data");
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError("User already exists");
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then(() => res.send({ name, avatar, email }))
    .catch((err) => {
      console.log(err.message);
      if (err.name === `ValidationError`) {
        next(new BadRequestError("Invalid data"));
      } else {
        next(err);
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
      .then((user) => res.send({ user }))
      .catch((err) => {
        console.error(err.name);

        if (err.name === "ValidationError") {
          next(new BadRequestError("Invalid data"));
        } else if (err.name === "DocumentNotFoundError") {
          next(new NotFoundError("User not found"));
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
      console.error(err.name);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User not found"));
      } else {
        next(err);
      }
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
      return res.send({ token });
    })
    .catch((err) => {
      console.log(err.name);
      if (err.message === "Incorrect email or password") {
        next(new UnauthorizedError("Invalid login"));
      } else {
        next(err);
      }
    });
};

module.exports = { createUser, getCurrentUser, updateUser, login };