require('dotenv').config();

console.log(process.env.NODE_ENV);

const express = require('express');

const mongoose = require('mongoose');

const cors = require("cors");

const { errors } = require("celebrate");

const { login, createUser } = require("./controllers/user");

const { errorHandler } = require("./middlewares/error-handler");

const { requestLogger, errorLogger } = require("./middlewares/logger");

const {
  validateAuth,
  validateCreateUser,
} = require("./middlewares/validation");

const routes = require("./routes");

const app = express();

const { PORT = 3001 } = process.env;

app.use(cors());

app.use(express.json());

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

app.use(requestLogger);

app.post("/signin", validateAuth, login);

app.post("/signup", validateCreateUser, createUser);

app.use(routes);

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

mongoose.connect('mongodb://127.0.0.1:27017/wtwr_db');

app.listen(PORT, () => {
  console.log(`app listening at port ${PORT}`);
  console.log('This is working');
})

