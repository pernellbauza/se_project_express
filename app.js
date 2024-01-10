const express = require('express');

const mongoose = require('mongoose');

const { PORT = 3001 } = process.env;

const app = express();

const cors = require("cors");

const { login, createUser } = require("./controllers/user");

mongoose.connect('mongodb://127.0.0.1:27017/wtwr_db')
.then(() => {
  console.log("Connected to DB");
})
.catch((e) => console.error(e));

const routes = require("./routes");

app.use(express.json());

app.use(cors());

app.post("/signin", login);

app.post("/signup", createUser);

//app.use((req, res, next) => {
//  req.user = {
//    _id: "6581259492ae6b84fd920b4b",
//  };
//  next();
//});

app.use(routes, require("./routes/index"));

app.listen(PORT, () => {
  console.log(`app listening at port ${PORT}`);
  console.log('This is working');
})

