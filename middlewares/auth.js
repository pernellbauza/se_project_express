const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/config");

const { HTTP_UNAUTHORIZED } = require("../utils/error");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(HTTP_UNAUTHORIZED).send({ message: "Authorization required 1" });
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error(err.name);
    res.status(HTTP_UNAUTHORIZED).send({ message: "Authorization required 2" });
  }

  req.user = payload;

  next();
};