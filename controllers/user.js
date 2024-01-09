const { default: mongoose } = require("mongoose");

const user = require("../models/user");

const { HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_CONFLICT, HTTP_INTERNAL_SERVER_ERROR, } = require("../utils/error");

const { JWT_SECRET } = require("../utils/config");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const e = require("express");

const createUser = async (req, res, next) => {
  try {
    const { name, avatar, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    if (name.length == 2 || name.length > 30) {
      const validationError = new Error("validation error");
      validationError.statusCode = HTTP_BAD_REQUEST;
      throw validationError;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      const validationError = new Error("Email cannot be empty");
      validationError.statusCode = HTTP_BAD_REQUEST;
      throw validationError;
    }

    const existingUser = await user.findOne({ email });
    if (existingUser) {
      const duplicateEmailError = new Error("Email already exsits");
      duplicateEmailError.statusCode = HTTP_CONFLICT;
      throw duplicateEmailError;
    }

    const newUser = await user.create({
      name,
      avatar,
      email,
      password: hash,
    });

    const responseData = {
      newUser: {
        name: newUser.name,
        avatar: newUser.avatar,
        email: newUser.email,
      },
    };

    res.send(responseData);
  } catch (e) {
    next(e);
  }
};

const updateUser = (req, res) => {
  const { userId } = req.params;
  const { avatar } = req.body;
  const { name } = req.body;

  user
    .findByIdAndUpdate(userId, { $set: { avatar } }, { new: true })
    .orFail()
    .then((user) => res.status(200).send({ data: user }))
    .catch((e) => {
      res.status(500).send({ message: "Error from update user", e });
    });
};

const getCurrentUser = (req, res) => {
  const id = req.user._id;

  user
    .findById(id)
    .orFail()
    .then((user) => {
      if (!user) {
        return res.status(HTTP_NOT_FOUND).json({ error: "User not found" });
      }
      const { id, name, avatar, email } = user;
      const userResponse = { id, name, avatar, email };

      res.json(userResponse);
      console.log(userResponse);
    })
    .catch((e) => {
      console.error("Error fetching user from the database: ", e);
      res
        .status(HTTP_INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return user
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((e) => {
      console.error(e);
      if (e.name === "INVALID_EMAIL_PASSWORD") {
        return res.status(400).send({ message: e.message });
      } else {
        res.status(401).send({ message: e.message });
      }
    });
};

module.exports = { createUser, getCurrentUser, updateUser, login };