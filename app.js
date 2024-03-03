const express = require('express');

const mongoose = require('mongoose');

const cors = require("cors");

const { PORT = 3001 } = process.env;

const { login, createUser } = require("./controllers/user");

const { errors } = require("celebrate");

const { errorHandler } = require("./middlewares/error-handler");

const { requestLogger, errorLogger } = require("./middlewares/logger");

const {
  validateAuth,
  validateCreateUser,
} = require("./middlewares/validation");

const routes = require("./routes");

const app = express();

app.use(express.json());

app.use(cors());

app.post("/signin", validateAuth, login);

app.post("/signup", validateCreateUser, createUser);

app.use(requestLogger);

app.use(routes);

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

mongoose.connect('mongodb://127.0.0.1:27017/wtwr_db');

app.listen(PORT, () => {
  console.log(`app listening at port ${PORT}`);
  console.log('This is working');
})

